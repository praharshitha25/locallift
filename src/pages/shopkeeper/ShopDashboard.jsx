import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc, where } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import { db } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { emptyConstraints, useCollection } from "../../firebase/firestoreHooks";
import IncomingRequests from "./components/IncomingRequests";
import LogSaleModal from "./components/LogSaleModal";
import SettlementSummary from "./components/SettlementSummary";
import ShelfInventory from "./components/ShelfInventory";
import ShopFreelancerDirectory from "./components/ShopFreelancerDirectory";
import ShopStatsBar from "./components/ShopStatsBar";
import { enrichConsignment, sameId } from "./components/shopDataHelpers";

const ShopDashboard = () => {
    const { currentUser, userDoc } = useAuth();
    const uid = currentUser?.uid;
    const currentShop = {
        id: uid,
        name: userDoc?.name || currentUser?.displayName || currentUser?.email || "Your Shop",
        email: userDoc?.email || currentUser?.email || "",
        location: userDoc?.location || "Kurnool",
        photoUrl: userDoc?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc?.name || "Shop")}&background=2D6A4F&color=fff`
    };

    const shopQuery = useMemo(() => uid ? [where("shopId", "==", uid)] : emptyConstraints, [uid]);
    const shopSalesQuery = useMemo(() => uid ? [where("shopId", "==", uid)] : emptyConstraints, [uid]);
    const makerQuery = useMemo(() => uid ? [where("role", "==", "maker")] : emptyConstraints, [uid]);
    const freelancerQuery = useMemo(() => uid ? [where("role", "==", "freelancer")] : emptyConstraints, [uid]);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [selectedSaleItem, setSelectedSaleItem] = useState(null);
    const [actionError, setActionError] = useState("");
    const [paidSaleIds, setPaidSaleIds] = useState([]);

    const { items: consignmentDocs, error: consignmentError, loading: consignmentLoading } = useCollection("consignments", shopQuery, Boolean(uid));
    const { items: productDocs, error: productError, loading: productLoading } = useCollection("products", emptyConstraints, Boolean(uid));
    const { items: salesDocs, error: salesError, loading: salesLoading } = useCollection("sales", shopSalesQuery, Boolean(uid));
    const { items: makerDocs, error: makerError, loading: makerLoading } = useCollection("users", makerQuery, Boolean(uid));
    const { items: freelancerDocs, error: freelancerError, loading: freelancerLoading } = useCollection("users", freelancerQuery, Boolean(uid));

    const enrichedConsignments = useMemo(
        () => consignmentDocs.map(consignment => enrichConsignment(consignment, {
            products: productDocs,
            makers: makerDocs,
            shops: [currentShop]
        })),
        [consignmentDocs, productDocs, makerDocs, currentShop.id, currentShop.name]
    );

    const pendingRequests = enrichedConsignments.filter(item => item.status === "Pending");
    const connectedMakers = enrichedConsignments.filter(item => item.requestType === "connection" && item.status === "Connected");
    const inventory = enrichedConsignments.filter(item => item.status === "Active");
    const paidSaleIdSet = useMemo(() => new Set(paidSaleIds.map(String)), [paidSaleIds]);
    const shopSales = salesDocs.map(sale => ({
        ...sale,
        paid: Boolean(sale.paid) || paidSaleIdSet.has(String(sale.id))
    }));
    const dataError = consignmentError || productError || salesError || makerError || freelancerError;
    const isLoading = consignmentLoading || productLoading || salesLoading || makerLoading || freelancerLoading;

    useEffect(() => {
        document.title = "Shopkeeper Dashboard - Local Lift";
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

        try {
            await updateDoc(doc(db, "consignments", request.id), {
                status: request.requestType === "connection" ? "Connected" : "Active",
                acceptedAt: serverTimestamp()
            });
        } catch (err) {
            setActionError(err.message || "Could not accept request.");
        }
    };

    const handleReject = async (request) => {
        setActionError("");

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

        try {
            const nextSold = item.quantitySold + saleData.quantitySold;
            const nextRemaining = item.quantityRemaining - saleData.quantitySold;

            await addDoc(collection(db, "sales"), {
                consignmentId: item.id,
                shopId: uid,
                shopName: currentShop.name,
                productId: item.productId,
                productName: item.product?.name || item.productName || "Unknown Product",
                makerId: item.makerId || item.product?.makerId,
                makerName: item.maker?.name || item.makerName || "Unknown Maker",
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
                status: nextRemaining <= 0 ? "Settled" : "Active",
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
            const paidIds = row.saleIds.map(String);
            setPaidSaleIds(prev => [...new Set([...prev.map(String), ...paidIds])]);

            await Promise.all(row.saleIds.map((saleId) => updateDoc(doc(db, "sales", saleId), {
                paid: true,
                paidAt: serverTimestamp()
            })));
        } catch (err) {
            setActionError(err.message || "Could not mark payout as paid.");
        }
    };

    const handleHireFreelancer = async (freelancer, description) => {
        setActionError("");

        try {
            await addDoc(collection(db, "gigs"), {
                freelancerId: freelancer.id,
                freelancerName: freelancer.name || freelancer.email || "Freelancer",
                requesterId: uid,
                requesterRole: "shopkeeper",
                businessName: currentShop.name,
                jobType: "Shop promotion",
                description,
                location: currentShop.location,
                budget: Number(freelancer.ratePerGig || 0),
                status: "Open",
                postedDate: new Date().toISOString().slice(0, 10),
                createdAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not send hire request.");
            return false;
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "requests", label: "Incoming Requests", badge: pendingRequests.length },
        { id: "makers", label: "Connected Makers", badge: connectedMakers.length },
        { id: "inventory", label: "Shelf Inventory" },
        { id: "settlement", label: "Settlement" },
        { id: "freelancers", label: "Hire Freelancer" }
    ];

    const renderSection = () => {
        switch (activeSection) {
            case "dashboard":
                return (
                    <div className="space-y-6">
                        <ShopStatsBar inventory={inventory} pendingRequests={pendingRequests} sales={shopSales} amountOwed={amountOwed} />
                        <IncomingRequests requests={pendingRequests} onAccept={handleAccept} onReject={handleReject} />
                        {renderConnectedMakers()}
                        <ShelfInventory inventory={inventory} onLogSale={setSelectedSaleItem} />
                    </div>
                );
            case "requests":
                return <IncomingRequests requests={pendingRequests} onAccept={handleAccept} onReject={handleReject} />;
            case "makers":
                return renderConnectedMakers();
            case "inventory":
            case "sale":
                return <ShelfInventory inventory={inventory} onLogSale={setSelectedSaleItem} />;
            case "settlement":
                return <SettlementSummary settlements={settlements} sales={shopSales} onMarkPaid={handleMarkPaid} />;
            case "freelancers":
                return <ShopFreelancerDirectory freelancers={freelancerDocs} onHire={handleHireFreelancer} />;
            default:
                return null;
        }
    };

    const renderConnectedMakers = () => {
        if (connectedMakers.length === 0) {
            return (
                <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                    No connected makers yet.
                </div>
            );
        }

        return (
            <section className="bg-white rounded-[12px] border border-gray-200 p-5 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Connected Makers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {connectedMakers.map(request => (
                        <article key={request.id} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={request.maker?.photoUrl || request.maker?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.maker?.name || "Maker")}&background=2D6A4F&color=fff`}
                                    alt={request.maker?.name || "Maker"}
                                    className="w-12 h-12 rounded-full bg-gray-100"
                                />
                                <div>
                                    <p className="font-bold text-gray-900">{request.maker?.name || "Unknown Maker"}</p>
                                    <p className="text-xs text-gray-600">{request.maker?.location || request.maker?.email || "Connected"}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">Ready for product drop-offs and collaboration.</p>
                        </article>
                    ))}
                </div>
            </section>
        );
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
                                        className={`w-full flex items-center justify-between text-left px-3 py-3 rounded-lg transition text-sm font-medium ${activeSection === item.id ? "bg-[#2D6A4F] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                    >
                                        <span>{item.label}</span>
                                        {item.badge > 0 && <span className="ml-2 rounded-full bg-[#F4A261] px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="bg-white rounded-[12px] border border-gray-200 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <img src={currentShop.photoUrl} alt={currentShop.name} className="w-12 h-12 rounded-full bg-gray-100" />
                            <div>
                                <p className="font-bold text-gray-900">{currentShop.name}</p>
                                <p className="text-xs text-gray-600">{currentShop.location}</p>
                            </div>
                        </div>
                        <button className="w-full px-3 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm">
                            Edit Profile
                        </button>
                    </div>
                </aside>

                <main className="flex-1 space-y-6">
                    {dataError && <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{dataError}</div>}
                    {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                    {activeSection !== "dashboard" && !isLoading && <ShopStatsBar inventory={inventory} pendingRequests={pendingRequests} sales={shopSales} amountOwed={amountOwed} />}
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
