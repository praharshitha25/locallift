import { useMemo, useState } from "react";
import { where } from "firebase/firestore";
import { useAuth } from "../../auth/AuthContext";
import { emptyConstraints, useCollection } from "../../firebase/firestoreHooks";
import { enrichConsignment, sameId, getInventoryStatus } from "./components/shopDataHelpers";

function Inventory() {
    const { currentUser } = useAuth();
    const uid = currentUser?.uid;

    const shopQuery = useMemo(() => uid ? [where("shopId", "==", uid)] : emptyConstraints, [uid]);
    const [filterStatus, setFilterStatus] = useState("Active");
    const [searchTerm, setSearchTerm] = useState("");

    const { items: consignmentDocs, loading: consignmentLoading } = useCollection("consignments", shopQuery, Boolean(uid));
    const { items: productDocs, loading: productLoading } = useCollection("products", emptyConstraints, Boolean(uid));
    const { items: makerDocs, loading: makerLoading } = useCollection("users", emptyConstraints, Boolean(uid));

    const enrichedConsignments = useMemo(
        () => consignmentDocs
            .filter(item => item.status === filterStatus)
            .map(consignment => enrichConsignment(consignment, {
                products: productDocs,
                makers: makerDocs,
                shops: []
            })),
        [consignmentDocs, productDocs, makerDocs, filterStatus]
    );

    const filteredInventory = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return enrichedConsignments.filter(item => {
            const searchText = [
                item.product?.name,
                item.maker?.name,
                item.product?.category
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return !term || searchText.includes(term);
        });
    }, [enrichedConsignments, searchTerm]);

    const isLoading = consignmentLoading || productLoading || makerLoading;

    return (
        <section className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by product name or maker"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        >
                            <option>Active</option>
                            <option>Settled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            {isLoading ? (
                <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                    <p className="text-gray-500">Loading inventory...</p>
                </div>
            ) : filteredInventory.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                    <p className="text-gray-500">
                        {filterStatus === "Active"
                            ? "No active inventory. Connect with makers and log drop-offs to populate inventory."
                            : "No settled inventory yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredInventory.map((item) => {
                        const statusColor = getInventoryStatus(item.quantityRemaining);
                        return (
                            <div key={item.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                {/* Product Image */}
                                <div className="w-full h-40 bg-gray-100 overflow-hidden">
                                    {item.product?.imageUrl || item.product?.image ? (
                                        <img
                                            src={item.product.imageUrl || item.product.image}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                            <span className="text-3xl">📦</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{item.product?.name || "Unknown Product"}</h3>
                                    <p className="text-xs text-gray-600 mb-3">By {item.maker?.name || "Unknown Maker"}</p>

                                    <div className="space-y-2 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <strong>{item.product?.category || "N/A"}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Retail Price:</span>
                                            <strong>₹{item.product?.retailPrice || 0}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Dropped:</span>
                                            <strong>{item.totalQuantity}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Sold:</span>
                                            <strong className="text-[#D97706]">{item.quantitySold}</strong>
                                        </div>
                                        <div className="border-t border-gray-300 pt-2 flex justify-between">
                                            <span className="text-gray-600">Remaining:</span>
                                            <strong className="text-lg">{item.quantityRemaining}</strong>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.className}`}>
                                            {statusColor.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {item.makerPercent}% to maker
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Inventory;

