import { useMemo, useState } from "react";

const MakerDiscovery = ({ makers, products = [], relationships = [], onSendRequest }) => {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMaker, setSelectedMaker] = useState(null);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [lastSentMaker, setLastSentMaker] = useState(null);
    const [sendingMakerId, setSendingMakerId] = useState("");
    const [error, setError] = useState("");

    const skillOptions = useMemo(() => {
        const allSkills = new Set();
        makers.forEach(maker => {
            (maker.productCategories || []).forEach(category => allSkills.add(category));
            (maker.skills || []).forEach(skill => allSkills.add(skill));
        });
        return ["all", ...Array.from(allSkills).sort()];
    }, [makers]);

    const relationshipRank = { Connected: 3, Pending: 2, Rejected: 1 };
    const relationshipByMakerId = relationships.reduce((map, request) => {
        const key = String(request.makerId);
        const current = map.get(key);

        if (!current || (relationshipRank[request.status] || 0) > (relationshipRank[current.status] || 0)) {
            map.set(key, request);
        }

        return map;
    }, new Map());

    const filteredMakers = makers.filter(maker => {
        const term = searchTerm.trim().toLowerCase();
        const makerSearchText = [maker.brandName, maker.name, maker.location, maker.shopCategory, maker.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        const matchesSearch = !term || makerSearchText.includes(term);
        const categories = [...(maker.productCategories || []), ...(maker.skills || [])].map(value => String(value).toLowerCase());
        const matchesFilter = filter === "all" || categories.includes(filter.toLowerCase());
        return matchesSearch && matchesFilter;
    });

    const selectedMakerProducts = selectedMaker
        ? products.filter(product => String(product.makerId) === String(selectedMaker.id))
        : [];

    const handleSendRequest = async (maker) => {
        setError("");
        setSendingMakerId(maker.id);

        const sent = onSendRequest ? await onSendRequest(maker) : false;

        if (sent) {
            setSentRequests(prev => new Set([...prev, maker.id]));
            setLastSentMaker(maker.id);
            setTimeout(() => setLastSentMaker(null), 3000);
        } else {
            setError("Could not send request. Please try again.");
        }

        setSendingMakerId("");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Makers</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or location"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        >
                            {skillOptions.map(option => (
                                <option key={option} value={option}>{option === "all" ? "All Focus Areas" : option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <p className="text-sm text-gray-500">
                            Browse makers with ready-made skills, crafted collections, or the right location for your shop.
                        </p>
                    </div>
                </div>
            </div>

            {filteredMakers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                    <p className="text-gray-500">No makers found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMakers.map(maker => {
                        const relationship = relationshipByMakerId.get(String(maker.id));
                        const status = sentRequests.has(maker.id) ? "Pending" : relationship?.status;
                        const isConnected = status === "Connected";
                        const isPending = status === "Pending";
                        const isSending = sendingMakerId === maker.id;

                        return (
                            <article key={maker.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                                <div className="w-full h-40 overflow-hidden bg-gray-100">
                                    {maker.coverImageURL || maker.coverImageUrl || maker.coverImage ? (
                                        <img
                                            src={maker.coverImageURL || maker.coverImageUrl || maker.coverImage}
                                            alt={maker.brandName || maker.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#2D6A4F] to-[#1f4d37] flex items-center justify-center">
                                            <span className="text-5xl">🎨</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">{maker.brandName || maker.name || "Maker"}</h3>
                                    <p className="text-xs text-gray-600 mb-3">{maker.location || "Kurnool"}</p>
                                    <div className="space-y-2 text-sm mb-4">
                                        {(maker.productCategories || []).length > 0 && (
                                            <div>
                                                <span className="font-medium text-gray-700">Categories:</span>
                                                <p className="text-gray-600">{maker.productCategories.join(", ")}</p>
                                            </div>
                                        )}
                                        {(maker.skills || []).length > 0 && (
                                            <div>
                                                <span className="font-medium text-gray-700">Skills:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {maker.skills.slice(0, 4).map(skill => (
                                                        <span key={skill} className="rounded-full bg-[#E6F4EA] px-2 py-1 text-[11px] font-semibold text-[#2D6A4F]">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSendRequest(maker)}
                                        disabled={isConnected || isPending || isSending}
                                        className={`w-full px-4 py-2 rounded-lg transition font-medium text-sm ${isConnected
                                            ? "bg-[#2D6A4F]/10 text-[#2D6A4F] cursor-default"
                                            : isPending
                                                ? "bg-green-100 text-green-700 cursor-default"
                                                : "bg-[#2D6A4F] text-white hover:bg-[#24563f]"
                                            }`}
                                    >
                                        {isConnected ? "Connected" : isPending ? "Request Sent" : isSending ? "Sending..." : status === "Rejected" ? "Request Again" : "Send Connection Request"}
                                    </button>
                                    {lastSentMaker === maker.id && (
                                        <p className="text-xs text-green-600 mt-2 font-medium">Connection request sent to {maker.brandName || maker.name}</p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMaker(maker)}
                                        className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {selectedMaker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-5xl overflow-y-auto rounded-[20px] bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedMaker.brandName || selectedMaker.name}</h2>
                                <p className="text-sm text-gray-600">{selectedMaker.location || "Location not set"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMaker(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                                <div className="rounded-[18px] bg-[#F5F5F0] p-5">
                                    <div className="w-full h-48 rounded-[18px] bg-gradient-to-br from-[#2D6A4F] to-[#1f4d37] flex items-center justify-center mb-5">
                                        <span className="text-6xl">🎨</span>
                                    </div>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div>
                                            <p className="font-semibold text-gray-900">Bio</p>
                                            <p className="mt-1 text-gray-700">{selectedMaker.bio || "No bio available yet."}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Focus Areas</p>
                                            <p className="mt-1 text-gray-700">{(selectedMaker.productCategories || []).join(", ") || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Skills</p>
                                            <p className="mt-1 text-gray-700">{(selectedMaker.skills || []).join(", ") || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-2 rounded-[18px] border border-gray-200 p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Maker Overview</h3>
                                                <p className="text-sm text-gray-500">Profile details and published products</p>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedMaker(null)}
                                                    className="px-4 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition text-sm font-medium"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="font-semibold text-gray-900">{selectedMaker.name || "Maker"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Brand</p>
                                                <p className="font-semibold text-gray-900">{selectedMaker.brandName || "Not set"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-semibold text-gray-900">{selectedMaker.email || "Not shared"}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-semibold text-gray-900">{selectedMaker.location || "Unknown"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[18px] border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Products by {selectedMaker.brandName || selectedMaker.name}</h3>
                                                <p className="text-sm text-gray-500">See all items published by this maker.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleSendRequest(selectedMaker)}
                                                disabled={sentRequests.has(selectedMaker.id) || relationshipByMakerId.get(String(selectedMaker.id))?.status === "Connected" || sendingMakerId === selectedMaker.id}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium ${sentRequests.has(selectedMaker.id) || relationshipByMakerId.get(String(selectedMaker.id))?.status === "Connected"
                                                    ? "bg-gray-200 text-gray-600 cursor-default"
                                                    : "bg-[#2D6A4F] text-white hover:bg-[#24563f]"
                                                    }`}
                                            >
                                                {sendingMakerId === selectedMaker.id ? "Sending..."
                                                    : relationshipByMakerId.get(String(selectedMaker.id))?.status === "Connected" ? "Connected"
                                                        : sentRequests.has(selectedMaker.id) ? "Request Sent"
                                                            : "Send Connection Request"}
                                            </button>
                                        </div>

                                        {selectedMakerProducts.length === 0 ? (
                                            <div className="text-center py-10 text-gray-500">This maker has not listed products yet.</div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedMakerProducts.map(product => (
                                                    <div key={product.id} className="rounded-[16px] border border-gray-200 overflow-hidden bg-white shadow-sm">
                                                        <div className="min-h-[170px] bg-gray-100 p-4 flex items-center justify-center">
                                                            {product.imageUrl || product.image || product.photoUrl ? (
                                                                <img
                                                                    src={product.imageUrl || product.image || product.photoUrl}
                                                                    alt={product.name}
                                                                    className="max-h-40 object-contain"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400">No image</span>
                                                            )}
                                                        </div>
                                                        <div className="p-4">
                                                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                                            <p className="text-xs text-gray-500 mb-3">{product.category || "Product"}</p>
                                                            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{product.description || "No description provided."}</p>
                                                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                                                                <div>
                                                                    <p className="text-gray-500">Retail</p>
                                                                    <p className="font-semibold">INR {product.retailPrice || 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Stock</p>
                                                                    <p className="font-semibold">{product.quantity ?? 0}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MakerDiscovery;
