import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc, where, runTransaction } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { emptyConstraints, useCollection } from "../../firebase/firestoreHooks";
import ProfileForm from "../../components/ProfileForm";
import StatsBar from "./components/StatsBar";
import ProductGrid from "./components/ProductGrid";
import AddProductModal from "./components/AddProductModal";
import ConsignmentTable from "./components/ConsignmentTable";
import LogDropoffModal from "./components/LogDropoffModal";
import EarningsSummary from "./components/EarningsSummary";
import ShopDiscovery from "./components/ShopDiscovery";
import MakerIncomingRequests from "./components/MakerIncomingRequests";
import FreelancerDirectory from "./components/FreelancerDirectory";
import SidebarNav from "./components/SidebarNav";

const MakerDashboard = () => {
    const { currentUser, userDoc } = useAuth();
    const uid = currentUser?.uid;
    const makerProfile = {
        id: uid,
        name: userDoc?.name || currentUser?.displayName || currentUser?.email || "Maker",
        email: userDoc?.email || currentUser?.email || "",
        location: userDoc?.location || "Kurnool",
        businessName: userDoc?.brandName || userDoc?.name || "Maker",
        rating: userDoc?.rating || "New",
        photoUrl: userDoc?.photoURL || userDoc?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc?.name || "Maker")}&background=2D6A4F&color=fff`,
        coverImageUrl: userDoc?.coverImageURL || userDoc?.coverImageUrl || userDoc?.coverImage || ""
    };

    const makerQuery = useMemo(() => uid ? [where("makerId", "==", uid)] : emptyConstraints, [uid]);
    const makerSalesQuery = useMemo(() => uid ? [where("makerId", "==", uid)] : emptyConstraints, [uid]);
    const shopkeeperQuery = useMemo(() => uid ? [where("role", "==", "shopkeeper")] : emptyConstraints, [uid]);
    const freelancerQuery = useMemo(() => uid ? [where("role", "==", "freelancer")] : emptyConstraints, [uid]);
    const postedGigsQuery = useMemo(() => uid ? [where("requesterId", "==", uid)] : emptyConstraints, [uid]);
    const { items: productsList, error: productsError, loading: productsLoading } = useCollection("products", makerQuery, Boolean(uid));
    const { items: consignmentsList, error: consignmentsError, loading: consignmentsLoading } = useCollection("consignments", makerQuery, Boolean(uid));
    const { items: makerSales, error: salesError, loading: salesLoading } = useCollection("sales", makerSalesQuery, Boolean(uid));
    const { items: shopsList, error: shopsError, loading: shopsLoading } = useCollection("users", shopkeeperQuery, Boolean(uid));
    const { items: freelancersList, error: freelancersError, loading: freelancersLoading } = useCollection("users", freelancerQuery, Boolean(uid));
    const { items: postedGigs, error: postedGigsError, loading: postedGigsLoading } = useCollection("gigs", postedGigsQuery, Boolean(uid));

    const dataError = productsError || consignmentsError || salesError || shopsError || freelancersError || postedGigsError;
    const isLoading = productsLoading || consignmentsLoading || salesLoading || shopsLoading || freelancersLoading || postedGigsLoading;
    const productConsignmentsList = useMemo(
        () => consignmentsList.filter(consignment => consignment.requestType !== "connection"),
        [consignmentsList]
    );
    const connectionRequestsList = useMemo(
        () => consignmentsList
            .filter(consignment => consignment.requestType === "connection")
            .map(request => ({
                ...request,
                shop: shopsList.find(shop => String(shop.id) === String(request.shopId)) || {
                    id: request.shopId,
                    name: request.shopName,
                    location: request.shopLocation || "",
                    type: request.shopType || ""
                }
            })),
        [consignmentsList, shopsList]
    );
    const pendingConnectionRequests = useMemo(
        () => connectionRequestsList.filter(request => request.status === "Pending"),
        [connectionRequestsList]
    );
    const connectedShopsList = useMemo(
        () => shopsList.filter(shop => connectionRequestsList.some(request => (
            String(request.shopId) === String(shop.id) && request.status === "Connected"
        ))),
        [shopsList, connectionRequestsList]
    );

    const pendingFreelancerRequests = useMemo(
        () => postedGigs.filter(gig => gig.status === "Applied"),
        [postedGigs]
    );

    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showLogDropoffModal, setShowLogDropoffModal] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState("");
    const [profileSaveError, setProfileSaveError] = useState("");
    const [activeSection, setActiveSection] = useState("dashboard");
    const [actionError, setActionError] = useState("");

    useEffect(() => {
        document.title = "Maker Dashboard - Local Lift";
    }, []);

    // Profile form is optional - users can click Edit Profile button to fill it out
    // No automatic prompt on login

    const saveProfileData = async (profileData) => {
        setProfileSaveError("");
        setProfileSaveMessage("");
        setIsSavingProfile(true);

        try {
            await setDoc(doc(db, "users", uid), {
                ...profileData,
                profileComplete: true,
                updatedAt: serverTimestamp()
            }, { merge: true });
            setProfileSaveMessage("Profile updated successfully!");
            setShowProfileForm(false);
            setTimeout(() => setProfileSaveMessage(""), 3000);
        } catch (err) {
            setProfileSaveError(err.message || "Could not save profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAddProduct = async (newProduct) => {
        setActionError("");

        try {
            await addDoc(collection(db, "products"), {
                ...newProduct,
                makerId: uid,
                makerName: makerProfile.name,
                createdAt: serverTimestamp()
            });
            setShowAddProductModal(false);
        } catch (err) {
            setActionError(err.message || "Could not save product.");
        }
    };

    const handleDeleteProduct = async (productId) => {
        setActionError("");

        try {
            await deleteDoc(doc(db, "products", productId));
        } catch (err) {
            setActionError(err.message || "Could not delete product.");
        }
    };

    const handleEditProduct = async (updatedProduct) => {
        setActionError("");
        const { id, createdAt, ...productData } = updatedProduct;

        try {
            await updateDoc(doc(db, "products", id), {
                ...productData,
                makerId: uid,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            setActionError(err.message || "Could not update product.");
        }
    };

    const handleLogDropoff = async (newDropoff) => {
        setActionError("");
        const selectedShop = connectedShopsList.find(shop => String(shop.id) === String(newDropoff.shopId));
        const selectedProduct = productsList.find(product => String(product.id) === String(newDropoff.productId));

        if (!selectedShop) {
            setActionError("Connect with a shop before logging a product drop-off.");
            return false;
        }

        if (!selectedProduct) {
            setActionError("Select a valid product before logging a drop-off.");
            return false;
        }

        if (!newDropoff.quantityDropped || newDropoff.quantityDropped <= 0) {
            setActionError("Quantity dropped must be greater than zero.");
            return false;
        }

        if (Number(selectedProduct.quantity || 0) < Number(newDropoff.quantityDropped)) {
            setActionError(`Not enough stock for ${selectedProduct.name}. Available: ${selectedProduct.quantity || 0}.`);
            return false;
        }

        const consignment = {
            ...newDropoff,
            shopId: newDropoff.shopId,
            shopName: selectedShop?.name || selectedShop?.email || "Shopkeeper",
            makerId: uid,
            makerName: makerProfile.name,
            productName: selectedProduct?.name || "Unknown Product",
            status: "Pending",
            quantitySold: 0,
            quantityRemaining: newDropoff.quantityDropped,
            droppedOn: new Date().toISOString().slice(0, 10)
        };

        try {
            const consignmentRef = doc(collection(db, "consignments"));

            await runTransaction(db, async (tx) => {
                const productRef = doc(db, "products", selectedProduct.id);

                // read current product quantity first (Firestore requires reads before writes)
                const prodSnap = await tx.get(productRef);
                if (!prodSnap.exists()) throw new Error("Product not found");
                const currentQty = Number(prodSnap.data().quantity || 0);
                const newQty = currentQty - Number(newDropoff.quantityDropped || 0);

                // now perform writes
                tx.set(consignmentRef, {
                    ...consignment,
                    createdAt: serverTimestamp()
                });

                tx.update(productRef, {
                    quantity: newQty >= 0 ? newQty : 0,
                    updatedAt: serverTimestamp()
                });
            });

            setShowLogDropoffModal(false);
            return true;
        } catch (err) {
            setActionError(err.message || "Could not log drop-off.");
            return false;
        }
    };

    const handleSendShopRequest = async (shop) => {
        setActionError("");
        const existingRequest = connectionRequestsList.find(request => (
            String(request.shopId) === String(shop.id) && request.status !== "Rejected"
        ));

        if (existingRequest) {
            return true;
        }

        try {
            await addDoc(collection(db, "consignments"), {
                requestType: "connection",
                shopId: shop.id,
                shopName: shop.name || shop.email || "Shopkeeper",
                makerId: uid,
                makerName: makerProfile.name,
                status: "Pending",
                quantityDropped: 0,
                quantitySold: 0,
                quantityRemaining: 0,
                splitPercentage: 50,
                droppedOn: new Date().toISOString().slice(0, 10),
                createdAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not send shop request.");
            return false;
        }
    };

    const handleHireFreelancer = async (freelancer, description) => {
        setActionError("");

        try {
            await addDoc(collection(db, "gigs"), {
                freelancerId: freelancer.id,
                freelancerName: freelancer.name || freelancer.email || "Freelancer",
                requesterId: uid,
                requesterRole: "maker",
                businessName: makerProfile.name,
                jobType: "Maker promotion",
                description,
                location: makerProfile.location,
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

    const handleUpdateGigStatus = async (gig, nextStatus) => {
        setActionError("");

        try {
            await updateDoc(doc(db, "gigs", gig.id), {
                status: nextStatus,
                statusUpdatedAt: serverTimestamp(),
                ...(nextStatus === "Accepted" ? { acceptedAt: serverTimestamp() } : {}),
                ...(nextStatus === "Rejected" ? { rejectedAt: serverTimestamp() } : {})
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not update gig status.");
            return false;
        }
    };

    const handleAcceptConnectionRequest = async (request) => {
        setActionError("");

        try {
            await updateDoc(doc(db, "consignments", request.id), {
                status: "Connected",
                acceptedAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not accept connection request.");
            return false;
        }
    };

    const handleRejectConnectionRequest = async (request) => {
        setActionError("");

        try {
            await updateDoc(doc(db, "consignments", request.id), {
                status: "Rejected",
                rejectedAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not reject connection request.");
            return false;
        }
    };

    const handleConfirmPayment = async (consignment) => {
        setActionError("");

        try {
            await updateDoc(doc(db, "consignments", consignment.id), {
                paymentConfirmed: true,
                paymentConfirmedAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not confirm payment.");
            throw err;
        }
    };

    const handleToggleNoDue = async (consignment, value) => {
        setActionError("");

        try {
            await updateDoc(doc(db, "consignments", consignment.id), {
                noDue: Boolean(value),
                noDueAt: serverTimestamp()
            });
            return true;
        } catch (err) {
            setActionError(err.message || "Could not update no-due status.");
            throw err;
        }
    };

    const renderSection = () => {
        const openDropoffModal = () => {
            if (connectedShopsList.length === 0) {
                setActiveSection("shops");
                return;
            }

            if (productsList.length === 0) {
                setActionError("Add a product before logging a drop-off.");
                setActiveSection("products");
                return;
            }

            setShowLogDropoffModal(true);
        };

        switch (activeSection) {
            case "dashboard":
                return (
                    <div className="space-y-6">
                        <StatsBar products={productsList} consignments={productConsignmentsList} sales={makerSales} />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">My Products</h2>
                                <button onClick={() => setShowAddProductModal(true)} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium">
                                    + Add New Product
                                </button>
                            </div>
                            <ProductGrid products={productsList} onDelete={handleDeleteProduct} onEdit={handleEditProduct} />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Active Consignments</h2>
                                <button onClick={openDropoffModal} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium">
                                    + New Drop-off
                                </button>
                            </div>
                            <ConsignmentTable consignments={productConsignmentsList} products={productsList} shops={shopsList} />
                        </div>

                        <EarningsSummary sales={makerSales} />
                    </div>
                );
            case "connectedShops":
                return (
                    <section className="bg-white rounded-[12px] border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Connected Shops</h2>
                                <p className="text-sm text-gray-500">Your active shop relationships are shown here.</p>
                            </div>
                            <span className="text-sm font-semibold text-[#2D6A4F]">{connectedShopsList.length} connected</span>
                        </div>
                        {connectedShopsList.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No connected shops yet. Accept a request or send a new shop request.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {connectedShopsList.map(shop => (
                                    <article key={shop.id} className="rounded-lg border border-gray-200 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={shop.photoUrl || shop.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name || "Shop")}&background=2D6A4F&color=fff`}
                                                alt={shop.name || "Shopkeeper"}
                                                className="w-12 h-12 rounded-full bg-gray-100"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900">{shop.name || shop.shopName || "Shopkeeper"}</p>
                                                <p className="text-xs text-gray-600">{shop.location || shop.email || "Connected"}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Ready for product drop-offs and collaboration.</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                );
            case "products":
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
                            <button onClick={() => setShowAddProductModal(true)} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium">
                                + Add New Product
                            </button>
                        </div>
                        <ProductGrid products={productsList} onDelete={handleDeleteProduct} onEdit={handleEditProduct} />
                    </div>
                );
            case "consignments":
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Consignments</h2>
                            <button onClick={openDropoffModal} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium">
                                + New Drop-off
                            </button>
                        </div>
                        <ConsignmentTable
                            consignments={productConsignmentsList}
                            products={productsList}
                            shops={shopsList}
                            onConfirmPayment={handleConfirmPayment}
                            onToggleNoDue={handleToggleNoDue}
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
            case "requests":
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Incoming Requests</h2>
                        <MakerIncomingRequests
                            requests={pendingConnectionRequests}
                            onAccept={handleAcceptConnectionRequest}
                            onReject={handleRejectConnectionRequest}
                        />
                    </div>
                );
            case "shops":
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Shops</h2>
                        <ShopDiscovery
                            shops={shopsList}
                            relationships={connectionRequestsList}
                            onSendRequest={handleSendShopRequest}
                        />
                    </div>
                );
            case "freelancers":
                return (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Freelancer Requests</h2>
                            {pendingFreelancerRequests.length === 0 ? (
                                <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                                    No applications pending review.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {pendingFreelancerRequests.map(gig => (
                                        <article key={gig.id} className="bg-white rounded-[12px] border border-gray-200 p-5 shadow-sm">
                                            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{gig.jobType}</h3>
                                                    <p className="text-sm text-gray-600">{gig.businessName} — INR {gig.budget}</p>
                                                    <p className="text-sm text-gray-500 mt-2">Applicant: {gig.freelancerName || "Unknown"}</p>
                                                    <p className="text-sm text-gray-500">Message: {gig.applicationMessage || "No message provided."}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateGigStatus(gig, "Accepted")}
                                                        className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateGigStatus(gig, "Rejected")}
                                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hire Freelancer</h2>
                            <FreelancerDirectory freelancers={freelancersList} onHire={handleHireFreelancer} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0]">
            <Navbar />

            {/* Show profile form if needed */}
            {showProfileForm && (
                <ProfileForm
                    role="maker"
                    initialData={userDoc || {}}
                    onSave={saveProfileData}
                    isSaving={isSavingProfile}
                    message="Complete your profile to get started"
                    onCancel={() => setShowProfileForm(false)}
                />
            )}

            {/* Show dashboard if profile is complete */}
            {!showProfileForm && (
                <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
                    <SidebarNav
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        maker={makerProfile}
                        onEditProfile={() => setShowProfileForm(true)}
                        pendingRequestsCount={pendingConnectionRequests.length}
                    />

                    <main className="flex-1">
                        {dataError && (
                            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                                {dataError}
                            </div>
                        )}
                        {profileSaveMessage && (
                            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                {profileSaveMessage}
                            </div>
                        )}
                        {profileSaveError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {profileSaveError}
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
            )}

            {showAddProductModal && (
                <AddProductModal
                    makerId={uid}
                    onClose={() => setShowAddProductModal(false)}
                    onSubmit={handleAddProduct}
                />
            )}

            {showLogDropoffModal && (
                <LogDropoffModal
                    products={productsList}
                    shops={connectedShopsList}
                    onClose={() => setShowLogDropoffModal(false)}
                    onSubmit={handleLogDropoff}
                />
            )}
        </div>
    );
};

export default MakerDashboard;
