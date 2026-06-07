import { useState } from "react";

const ShopDiscovery = ({ shops, relationships = [], onSendRequest }) => {
    const [filter, setFilter] = useState("all");
    const [distanceFilter, setDistanceFilter] = useState(5);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [lastSentShop, setLastSentShop] = useState(null);
    const [sendingShopId, setSendingShopId] = useState("");
    const [error, setError] = useState("");

    const shopTypes = ["Gift Store", "Fashion & Lifestyle", "Handmade Store", "Food & Groceries", "Natural Products"];
    const relationshipRank = { Connected: 3, Pending: 2, Rejected: 1 };
    const relationshipByShopId = relationships.reduce((map, request) => {
        const key = String(request.shopId);
        const current = map.get(key);

        if (!current || (relationshipRank[request.status] || 0) > (relationshipRank[current.status] || 0)) {
            map.set(key, request);
        }

        return map;
    }, new Map());

    const filteredShops = shops.filter(shop => {
        const typeMatch = filter === "all" || shop.type === filter;
        const distanceMatch = Number(shop.distance ?? 0) <= distanceFilter;
        return typeMatch && distanceMatch;
    });

    const handleSendRequest = async (shop) => {
        setError("");
        setSendingShopId(shop.id);

        const sent = onSendRequest ? await onSendRequest(shop) : false;

        if (sent) {
            setSentRequests(prev => new Set([...prev, shop.id]));
            setLastSentShop(shop.id);
            setTimeout(() => setLastSentShop(null), 3000);
        } else {
            setError("Could not send request. Please try again.");
        }

        setSendingShopId("");
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Type</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        >
                            <option value="all">All Types</option>
                            {shopTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Distance: {distanceFilter} km</label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={distanceFilter}
                            onChange={(e) => setDistanceFilter(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Shop Cards */}
            {filteredShops.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                    <p className="text-gray-500">No shops found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredShops.map(shop => {
                        const relationship = relationshipByShopId.get(String(shop.id));
                        const status = sentRequests.has(shop.id) ? "Pending" : relationship?.status;
                        const isConnected = status === "Connected";
                        const isPending = status === "Pending";
                        const isSending = sendingShopId === shop.id;

                        return (
                            <div key={shop.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                {/* Shop Image */}
                                <div className="w-full h-40 overflow-hidden bg-gray-100">
                                    {shop.coverImageURL || shop.coverImageUrl || shop.coverImage ? (
                                        <img
                                            src={shop.coverImageURL || shop.coverImageUrl || shop.coverImage}
                                            alt={shop.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#2D6A4F] to-[#1f4d37] flex items-center justify-center">
                                            <span className="text-5xl">🏪</span>
                                        </div>
                                    )}
                                </div>

                                {/* Shop Details */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{shop.name}</h3>
                                    <p className="text-xs text-gray-600 mb-3">{shop.type || "Shopkeeper"}</p>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span>📍</span>
                                            <span>{shop.location || "Kurnool"}</span>
                                            <span className="text-gray-500">({shop.distance ?? 0} km away)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span>🛑</span>
                                            <span>{shop.shelfSlots ?? 0} shelf slots available</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSendRequest(shop)}
                                        disabled={isPending || isConnected || isSending}
                                        className={`w-full px-4 py-2 rounded-lg transition font-medium text-sm ${isConnected
                                            ? "bg-[#2D6A4F]/10 text-[#2D6A4F] cursor-default"
                                            : isPending
                                                ? "bg-green-100 text-green-700 cursor-default"
                                                : "bg-[#2D6A4F] text-white hover:bg-[#24563f]"
                                            }`}
                                    >
                                        {isConnected ? "Connected" : isPending ? "Request Sent" : isSending ? "Sending..." : status === "Rejected" ? "Request Again" : "Send Connection Request"}
                                    </button>
                                    {lastSentShop === shop.id && (
                                        <p className="text-xs text-green-600 mt-2 font-medium">Connection request sent to {shop.name}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShopDiscovery;
