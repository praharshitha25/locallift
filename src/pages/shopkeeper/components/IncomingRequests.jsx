const IncomingRequests = ({ requests, onAccept, onReject }) => {
    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                No pending requests
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {requests.map(request => {
                const productImageUrl = request.product?.imageUrl || request.product?.image || request.product?.photoUrl;
                return (
                    <article key={request.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
                        <div className="grid sm:grid-cols-[160px_1fr]">
                            <div className="h-44 sm:h-full bg-gray-100">
                                {productImageUrl ? (
                                    <img
                                        src={productImageUrl}
                                        alt={request.product?.name || "Product"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#2D6A4F]/10 text-[#2D6A4F] font-bold text-sm text-center px-4">
                                        Connection Request
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900">{request.maker?.name || "Unknown Maker"}</p>
                                        <p className="text-xs text-gray-500">{request.shop?.distance ?? "0.5"} km away</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                                        Pending
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900">
                                    {request.requestType === "connection" ? "Wants to connect with your shop" : request.product?.name || request.productName || "Unknown Product"}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {request.requestType === "connection" ? request.shopName || "Shop request" : request.product?.category || "Uncategorized"}
                                </p>

                                {request.requestType === "connection" ? (
                                    <p className="text-sm text-gray-600 mb-4">
                                        Accept this request to start a maker relationship. Product drop-offs can be handled separately.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500">Quantity Offered</p>
                                            <p className="font-semibold text-gray-900">{request.quantityDropped}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Profit Split</p>
                                            <p className="font-semibold text-gray-900">{request.makerPercent}/{request.shopPercent}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Wholesale</p>
                                            <p className="font-semibold text-gray-900">INR {request.product?.wholesalePrice || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Retail</p>
                                            <p className="font-semibold text-gray-900">INR {request.product?.retailPrice || "-"}</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mb-4">Dropped off: {request.droppedOn || "Today"}</p>

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
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default IncomingRequests;
