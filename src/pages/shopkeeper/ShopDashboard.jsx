import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import { db } from "../../firebase/config";
import { consignments, freelancers, makers, products, sales, shops } from "../../data/seedData";
import IncomingRequests from "./components/IncomingRequests";
import LogSaleModal from "./components/LogSaleModal";
import SettlementSummary from "./components/SettlementSummary";
import ShelfInventory from "./components/ShelfInventory";
import ShopFreelancerDirectory from "./components/ShopFreelancerDirectory";
import ShopStatsBar from "./components/ShopStatsBar";
import { enrichConsignment, sameId } from "./components/shopDataHelpers";

const readSnapshot = (snapshot) => snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
}));

const emptyConstraints = [];

const useCollectionFallback = (collectionName, fallbackData, constraints = emptyConstraints) => {
    const [items, setItems] = useState(fallbackData);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const collectionRef = collection(db, collectionName);
        const collectionQuery = constraints.length > 0
            ? query(collectionRef, ...constraints)
            : collectionRef;

        const timeoutId = window.setTimeout(() => {
            if (!isMounted) return;
            setItems(fallbackData);
            setLoading(false);
            setError("Unable to connect to Firestore. Showing seed data.");
        }, 2500);

        const unsubscribe = onSnapshot(
            collectionQuery,
            (snapshot) => {
                if (!isMounted) return;
                clearTimeout(timeoutId);
                const firestoreItems = readSnapshot(snapshot);
                setItems(firestoreItems.length > 0 ? firestoreItems : fallbackData);
                setError("");
                setLoading(false);
            },
            (err) => {
                if (!isMounted) return;
                clearTimeout(timeoutId);
                setItems(fallbackData);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, [collectionName, fallbackData, constraints]);

    return { items, error, loading };
};

const ShopDashboard = () => {
    const currentShop = shops[0];
    const shopFallbackConsignments = useMemo(
        () => consignments.filter(consignment => sameId(consignment.shopId, currentShop.id)),
        [currentShop.id]
    );

    const [activeSection, setActiveSection] = useState("dashboard");
    const [selectedSaleItem, setSelectedSaleItem] = useState(null);
    const [actionError, setActionError] = useState("");
    const [seedOverrides, setSeedOverrides] = useState({});
    const [localSales, setLocalSales] = useState([]);
    const [paidSaleIds, setPaidSaleIds] = useState([]);

    const { items: consignmentDocs, error: consignmentError, loading: consignmentLoading } = useCollectionFallback("consignments", shopFallbackConsignments);
    const { items: productDocs, error: productError, loading: productLoading } = useCollectionFallback("products", products);
    const { items: salesDocs, error: salesError, loading: salesLoading } = useCollectionFallback("sales", sales);
    const { items: freelancerDocs, error: freelancerError, loading: freelancerLoading } = useCollectionFallback("freelancers", freelancers);

    const effectiveConsignmentDocs = useMemo(
        () => consignmentDocs.map(consignment => ({
            ...consignment,
            ...(seedOverrides[consignment.id] || {})
        })),
        [consignmentDocs, seedOverrides]
    );

    const enrichedConsignments = useMemo(
        () => effectiveConsignmentDocs
            .filter(consignment => sameId(consignment.shopId, currentShop.id))
            .map(consignment => enrichConsignment(consignment, {
                products: productDocs,
                makers,
                shops
            })),
        [effectiveConsignmentDocs, productDocs, currentShop.id]
    );

    const pendingRequests = enrichedConsignments.filter(item => item.status === "Pending");
    const inventory = enrichedConsignments.filter(item => item.status === "Active");
    const paidSaleIdSet = useMemo(() => new Set(paidSaleIds.map(String)), [paidSaleIds]);
    const shopSales = [
        ...salesDocs.filter(sale => sameId(sale.shopId, currentShop.id) || sale.shopName === currentShop.name),
        ...localSales
    ].map(sale => ({
        ...sale,
        paid: Boolean(sale.paid) || paidSaleIdSet.has(String(sale.id))
    }));
    const dataError = "";
    const isLoading = false;

    useEffect(() => {
        document.title = "Shopkeeper Dashboard — Local Lift";
    }, []);

    const settlements = useMemo(() => {
        const rows = new Map();

        shopSales.forEach(sale => {
            const consignment = enrichedConsignments.find(item => sameId(item.id, sale.consignmentId));
            const productName = sale.productName || consignment?.product?.name || "Unknown Product";
            const makerName = sale.makerName || consignment?.maker?.name || "Unknown Maker";
            const key = `${makerName}-${productName}`;
            const existing = rows.get(key) || {
                key,
                makerName,
                productName,
                unitsSold: 0,
                amountOwed: 0,
                saleIds: [],
                paid: true
            };

            existing.unitsSold += Number(sale.quantitySold || 0);
            existing.amountOwed += Number(sale.makerCut || 0);
            existing.saleIds.push(sale.id);
            existing.paid = existing.paid && Boolean(sale.paid);
            rows.set(key, existing);
        });

        return [...rows.values()];
    }, [shopSales, enrichedConsignments]);

    const amountOwed = settlements.reduce((sum, row) => sum + (row.paid ? 0 : row.amountOwed), 0);

    const handleAccept = async (request) => {
        setActionError("");
        if (typeof request.id === "number") {
            setSeedOverrides(prev => ({
                ...prev,
                [request.id]: { status: "Active" }
            }));
            return;
        }

        try {
            await updateDoc(doc(db, "consignments", request.id), {
                status: "Active",
                acceptedAt: serverTimestamp()
            });
        } catch (err) {
            setActionError(err.message || "Could not accept request.");
        }
    };

    const handleReject = async (request) => {
        setActionError("");
        if (typeof request.id === "number") {
            setSeedOverrides(prev => ({
                ...prev,
                [request.id]: { status: "Rejected" }
            }));
            return;
        }

        try {
            await updateDoc(doc(db, "consignments", request.id), {
                status: "Rejected",
                rejectedAt: serverTimestamp()
            });
        } catch (err) {
            setActionError(err.message || "Could not reject request.");
        }
    };

    const handleConfirmSale = async (item, saleData) => {
        setActionError("");

        if (saleData.quantitySold > item.quantityRemaining) {
            setActionError("Quantity sold cannot exceed units remaining.");
            return false;
        }

        if (typeof item.id === "number") {
            const nextSold = item.quantitySold + saleData.quantitySold;
            const nextRemaining = item.quantityRemaining - saleData.quantitySold;

            setSeedOverrides(prev => ({
                ...prev,
                [item.id]: { quantitySold: nextSold, quantityRemaining: nextRemaining, status: "Active" }
            }));
            setLocalSales(prev => [
                ...prev,
                {
                    id: `local-${Date.now()}`,
                    consignmentId: item.id,
                    shopId: currentShop.id,
                    shopName: currentShop.name,
                    productId: item.productId,
                    productName: item.product?.name || "Unknown Product",
                    makerId: item.makerId || item.product?.makerId,
                    makerName: item.maker?.name || "Unknown Maker",
                    quantitySold: saleData.quantitySold,
                    totalRevenue: saleData.totalRevenue,
                    makerCut: saleData.makerCut,
                    shopProfit: saleData.shopProfit,
                    splitPercentage: item.makerPercent,
                    paid: false,
                    date: new Date().toISOString().slice(0, 10)
                }
            ]);
            setSelectedSaleItem(null);
            setActiveSection("settlement");
            return true;
        }

        try {
            const nextSold = item.quantitySold + saleData.quantitySold;
            const nextRemaining = item.quantityRemaining - saleData.quantitySold;

            await addDoc(collection(db, "sales"), {
                consignmentId: item.id,
                shopId: currentShop.id,
                shopName: currentShop.name,
                productId: item.productId,
                productName: item.product?.name || "Unknown Product",
                makerId: item.makerId || item.product?.makerId,
                makerName: item.maker?.name || "Unknown Maker",
                quantitySold: saleData.quantitySold,
                totalRevenue: saleData.totalRevenue,
                makerCut: saleData.makerCut,
                shopProfit: saleData.shopProfit,
                splitPercentage: item.makerPercent,
                paid: false,
                date: new Date().toISOString().slice(0, 10),
                createdAt: serverTimestamp()
            });

            await updateDoc(doc(db, "consignments", item.id), {
                quantitySold: nextSold,
                quantityRemaining: nextRemaining,
                status: nextRemaining <= 0 ? "Active" : "Active",
                updatedAt: serverTimestamp()
            });

            setSelectedSaleItem(null);
            setActiveSection("settlement");
            return true;
        } catch (err) {
            setActionError(err.message || "Could not log sale.");
            return false;
        }
    };

    const handleMarkPaid = async (row) => {
        setActionError("");

        try {
            const localIds = row.saleIds.filter(saleId => String(saleId).startsWith("local-"));
            const seedIds = row.saleIds.filter(saleId => typeof saleId === "number");
            const firestoreIds = row.saleIds.filter(saleId => typeof saleId !== "number" && !String(saleId).startsWith("local-"));
            const paidIds = row.saleIds.map(String);

            setPaidSaleIds(prev => [...new Set([...prev.map(String), ...paidIds])]);

            if (localIds.length > 0) {
                setLocalSales(prev => prev.map(sale => localIds.includes(sale.id) ? { ...sale, paid: true } : sale));
            }

            if (seedIds.length > 0) {
                setLocalSales(prev => prev.map(sale => seedIds.includes(sale.id) ? { ...sale, paid: true } : sale));
            }

            await Promise.all(firestoreIds.map((saleId) => updateDoc(doc(db, "sales", saleId), {
                paid: true,
                paidAt: serverTimestamp()
            })));
        } catch (err) {
            setActionError(err.message || "Could not mark payout as paid.");
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "requests", label: "Incoming Requests", badge: pendingRequests.length },
        { id: "inventory", label: "Shelf Inventory" },
        { id: "sale", label: "Log a Sale" },
        { id: "settlement", label: "Settlement" },
        { id: "freelancers", label: "Hire Freelancer" }
    ];

    const renderSection = () => {
        switch (activeSection) {
            case "dashboard":
                return (
                    <div className="space-y-6">
                        <ShopStatsBar
                            inventory={inventory}
                            pendingRequests={pendingRequests}
                            sales={shopSales}
                            amountOwed={amountOwed}
                        />
                        <IncomingRequests requests={pendingRequests} onAccept={handleAccept} onReject={handleReject} />
                        <ShelfInventory inventory={inventory} onLogSale={setSelectedSaleItem} />
                    </div>
                );
            case "requests":
                return <IncomingRequests requests={pendingRequests} onAccept={handleAccept} onReject={handleReject} />;
            case "inventory":
                return <ShelfInventory inventory={inventory} onLogSale={setSelectedSaleItem} />;
            case "sale":
                return <ShelfInventory inventory={inventory} onLogSale={setSelectedSaleItem} />;
            case "settlement":
                return <SettlementSummary settlements={settlements} sales={shopSales} onMarkPaid={handleMarkPaid} />;
            case "freelancers":
                return <ShopFreelancerDirectory freelancers={freelancerDocs} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0]">
            <Navbar />
            <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
                <aside className="w-full lg:w-64 flex flex-col">
                    <div className="bg-white rounded-[12px] border border-gray-200 p-4 mb-6">
                        <h1 className="text-xl font-bold text-[#2D6A4F]">Local Lift</h1>
                    </div>

                    <nav className="bg-white rounded-[12px] border border-gray-200 p-3 mb-6 flex-1">
                        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                            {navItems.map(item => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center justify-between text-left px-3 py-3 rounded-lg transition text-sm font-medium ${activeSection === item.id
                                            ? "bg-[#2D6A4F] text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <span>{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="ml-2 rounded-full bg-[#F4A261] px-2 py-0.5 text-xs font-bold text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="bg-white rounded-[12px] border border-gray-200 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <img
                                src={currentShop.image}
                                alt={currentShop.name}
                                className="w-12 h-12 rounded-full bg-gray-100"
                            />
                            <div>
                                <p className="font-bold text-gray-900">Mr. Davis</p>
                                <p className="text-xs text-gray-600">{currentShop.name} | {currentShop.location}</p>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-900 mb-4">4.6 rating</p>
                        <button className="w-full px-3 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm">
                            Edit Profile
                        </button>
                    </div>
                </aside>

                <main className="flex-1 space-y-6">
                    {dataError && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            Firebase data is unavailable, so seed data is being shown. {dataError}
                        </div>
                    )}
                    {actionError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}
                    {activeSection !== "dashboard" && !isLoading && (
                        <ShopStatsBar
                            inventory={inventory}
                            pendingRequests={pendingRequests}
                            sales={shopSales}
                            amountOwed={amountOwed}
                        />
                    )}
                    {isLoading ? (
                        <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                            Loading shopkeeper data...
                        </div>
                    ) : renderSection()}
                </main>
            </div>

            {selectedSaleItem && (
                <LogSaleModal
                    item={selectedSaleItem}
                    onClose={() => setSelectedSaleItem(null)}
                    onConfirm={handleConfirmSale}
                />
            )}
        </div>
    );
};

export default ShopDashboard;
