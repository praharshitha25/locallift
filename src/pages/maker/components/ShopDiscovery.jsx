import { useState } from "react";

const ShopDiscovery = ({ shops }) => {
    const [filter, setFilter] = useState("all");
    const [distanceFilter, setDistanceFilter] = useState(5);

    const shopTypes = ["Gift Store", "Fashion & Lifestyle", "Handmade Store", "Food & Groceries", "Natural Products"];

    const filteredShops = shops.filter(shop => {
        const typeMatch = filter === "all" || shop.type === filter;
        const distanceMatch = shop.distance <= distanceFilter;
        return typeMatch && distanceMatch;
    });

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
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
                    {filteredShops.map(shop => (
                        <div key={shop.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                            {/* Shop Image */}
                            <div className="w-full h-40 bg-gradient-to-br from-[#2D6A4F] to-[#1f4d37] flex items-center justify-center">
                                <span className="text-5xl">🏪</span>
                            </div>

                            {/* Shop Details */}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{shop.name}</h3>
                                <p className="text-xs text-gray-600 mb-3">{shop.type}</p>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span>📍</span>
                                        <span>{shop.location}</span>
                                        <span className="text-gray-500">({shop.distance} km away)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <span>🛑</span>
                                        <span>{shop.shelfSlots} shelf slots available</span>
                                    </div>
                                </div>

                                <button className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium text-sm">
                                    Send Connection Request
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopDiscovery;