const MakerIncomingRequests = ({ requests, onAccept, onReject }) => {
    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                No pending connection requests yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {requests.map(request => (
                <article key={request.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                                <p className="font-bold text-gray-900">{request.shop?.name || request.shopName || "Shopkeeper"}</p>
                                {request.shop?.location && (
                                    <p className="text-xs text-gray-500">{request.shop.location}</p>
                                )}
                            </div>
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                                Pending
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">Wants to connect with your maker profile</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Accept to establish a shop relationship and enable drop-offs once your catalog is ready.
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                                <p className="text-gray-500">Shop</p>
                                <p className="font-semibold text-gray-900">{request.shop?.name || request.shopName || "Unknown Shop"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Location</p>
                                <p className="font-semibold text-gray-900">{request.shop?.location || "Unknown"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Type</p>
                                <p className="font-semibold text-gray-900">{request.shop?.type || "Retail"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Requested</p>
                                <p className="font-semibold text-gray-900">{request.droppedOn || "Today"}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => onAccept(request)}
                                className="flex-1 px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium"
                            >
                                Accept
                            </button>
                            <button
                                type="button"
                                onClick={() => onReject(request)}
                                className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default MakerIncomingRequests;
