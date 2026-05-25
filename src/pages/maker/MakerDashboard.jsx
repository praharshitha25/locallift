import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import StatsBar from "./components/StatsBar";
import ProductGrid from "./components/ProductGrid";
import AddProductModal from "./components/AddProductModal";
import ConsignmentTable from "./components/ConsignmentTable";
import LogDropoffModal from "./components/LogDropoffModal";
import EarningsSummary from "./components/EarningsSummary";
import ShopDiscovery from "./components/ShopDiscovery";
import FreelancerDirectory from "./components/FreelancerDirectory";
import SidebarNav from "./components/SidebarNav";
import { makers, products, consignments, sales, shops, freelancers } from "../../data/seedData";

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

const MakerDashboard = () => {
    const currentMaker = makers[0]; // Sarah K.
    const makerProducts = useMemo(() => products.filter(p => p.makerId === currentMaker.id), [currentMaker.id]);
    const makerConsignments = useMemo(() => consignments.filter(c => c.makerId === currentMaker.id), [currentMaker.id]);
    const makerQuery = useMemo(() => [where("makerId", "==", currentMaker.id)], [currentMaker.id]);

    const [localProducts, setLocalProducts] = useState([]);
    const [localConsignments, setLocalConsignments] = useState([]);

    const { items: productsFromDb, error: productsError, loading: productsLoading } = useCollectionFallback(
        "products",
        makerProducts,
        makerQuery
    );
    const { items: consignmentsFromDb, error: consignmentsError, loading: consignmentsLoading } = useCollectionFallback(
        "consignments",
        makerConsignments,
        makerQuery
    );
    const { items: makerSales, error: salesError, loading: salesLoading } = useCollectionFallback("sales", sales);
    const { items: shopsList, error: shopsError, loading: shopsLoading } = useCollectionFallback("shops", shops);
    const { items: freelancersList, error: freelancersError, loading: freelancersLoading } = useCollectionFallback("freelancers", freelancers);

    const productsList = useMemo(() => [...localProducts, ...productsFromDb], [localProducts, productsFromDb]);
    const consignmentsList = useMemo(() => [...localConsignments, ...consignmentsFromDb], [localConsignments, consignmentsFromDb]);

    const dataError = productsError || consignmentsError || salesError || shopsError || freelancersError;
    const isLoading = productsLoading || consignmentsLoading || salesLoading || shopsLoading || freelancersLoading;

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showLogDropoffModal, setShowLogDropoffModal] = useState(false);
    const [activeSection, setActiveSection] = useState("dashboard");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        document.title = "Maker Dashboard — Local Lift";
    }, []);

    const handleAddProduct = async (newProduct) => {
        setActionError("");
        // If newProduct has a numeric id it's local; otherwise try to write to Firestore
        if (typeof newProduct.id === "number" || String(newProduct.id).startsWith("prod-")) {
            setLocalProducts(prev => [newProduct, ...prev]);
            setShowAddProductModal(false);
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "products"), {
                ...newProduct,
                createdAt: serverTimestamp()
            });
            setShowAddProductModal(false);
            return docRef.id;
        } catch (err) {
            setLocalProducts(prev => [{ ...newProduct, id: `prod-${Date.now()}` }, ...prev]);
            setActionError(err.message || "Could not save product to Firestore. Saved locally instead.");
            setShowAddProductModal(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        setActionError("");
        if (typeof productId === "number" || String(productId).startsWith("prod-")) {
            setLocalProducts(prev => prev.filter(product => product.id !== productId));
            return;
        }

        try {
            await deleteDoc(doc(db, "products", productId));
        } catch (err) {
            setActionError(err.message || "Could not delete product.");
        }
    };

    const handleEditProduct = async (updatedProduct) => {
        setActionError("");
        if (typeof updatedProduct.id === "number" || String(updatedProduct.id).startsWith("prod-")) {
            setLocalProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            return;
        }

        const { id, createdAt, ...productData } = updatedProduct;
        try {
            await updateDoc(doc(db, "products", id), {
                ...productData,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            setActionError(err.message || "Could not update product.");
        }
    };

    const handleLogDropoff = async (newDropoff) => {
        setActionError("");
        const normalizedShopId = Number.isNaN(Number(newDropoff.shopId)) ? newDropoff.shopId : Number(newDropoff.shopId);
        const consignment = {
            ...newDropoff,
            shopId: normalizedShopId,
            makerId: currentMaker.id,
            status: "Pending",
            quantitySold: 0,
            quantityRemaining: newDropoff.quantityDropped
        };

        try {
            const docRef = await addDoc(collection(db, "consignments"), {
                ...consignment,
                droppedOn: new Date().toISOString().slice(0, 10),
                createdAt: serverTimestamp()
            });
            setShowLogDropoffModal(false);
            return true;
        } catch (err) {
            // fallback to local
            const localConsignment = {
                ...consignment,
                id: `cons-${Date.now()}`,
                droppedOn: new Date().toISOString().slice(0, 10),
                createdAt: new Date().toISOString()
            };
            setLocalConsignments(prev => [localConsignment, ...prev]);
            setActionError(err.message || "Could not log drop-off to Firestore. Saved locally instead.");
            setShowLogDropoffModal(false);
            return true;
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case "dashboard":
                return (
                    <div className="space-y-6">
                        <StatsBar products={productsList} consignments={consignmentsList} sales={makerSales} />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">My Products</h2>
                                <button
                                    onClick={() => setShowAddProductModal(true)}
                                    className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                                >
                                    + Add New Product
                                </button>
                            </div>
                            <ProductGrid
                                products={productsList}
                                onDelete={handleDeleteProduct}
                                onEdit={handleEditProduct}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Active Consignments</h2>
                                <button
                                    onClick={() => setShowLogDropoffModal(true)}
                                    className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                                >
                                    + New Drop-off
                                </button>
                            </div>
                            <ConsignmentTable
                                consignments={consignmentsList}
                                products={productsList}
                                shops={shopsList}
                            />
                        </div>

                        <EarningsSummary sales={makerSales} />
                    </div>
                );
            case "products":
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                            <button
                                onClick={() => setShowAddProductModal(true)}
                                className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                            >
                                + Add New Product
                            </button>
                        </div>
                        <ProductGrid
                            products={productsList}
                            onDelete={handleDeleteProduct}
                            onEdit={handleEditProduct}
                        />
                    </div>
                );
            case "consignments":
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Consignments</h2>
                            <button
                                onClick={() => setShowLogDropoffModal(true)}
                                className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                            >
                                + New Drop-off
                            </button>
                        </div>
                        <ConsignmentTable
                            consignments={consignmentsList}
                            products={productsList}
                            shops={shopsList}
                        />
                    </div>
                );
            case "earnings":
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales & Earnings</h2>
                        <EarningsSummary sales={makerSales} />
                    </div>
                );
            case "shops":
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Shops</h2>
                        <ShopDiscovery shops={shopsList} />
                    </div>
                );
            case "freelancers":
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hire Freelancer</h2>
                        <FreelancerDirectory freelancers={freelancersList} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0]">
            <Navbar />
            <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
                {/* Sidebar */}
                <SidebarNav
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    maker={currentMaker}
                />

                {/* Main Content */}
                <main className="flex-1">
                    {dataError && (
                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                            Firebase data is unavailable, so seed data is being shown. {dataError}
                        </div>
                    )}
                    {actionError && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}
                    {isLoading ? (
                        <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                            Loading maker data...
                        </div>
                    ) : renderSection()}
                </main>
            </div>

            {/* Modals */}
            {showAddProductModal && (
                <AddProductModal
                    makerId={currentMaker.id}
                    onClose={() => setShowAddProductModal(false)}
                    onSubmit={handleAddProduct}
                />
            )}

            {showLogDropoffModal && (
                <LogDropoffModal
                    products={productsList}
                    shops={shopsList}
                    onClose={() => setShowLogDropoffModal(false)}
                    onSubmit={handleLogDropoff}
                />
            )}
        </div>
    );
};

export default MakerDashboard;
