import { useState } from "react";

const sameId = (left, right) => String(left) === String(right);

const ConsignmentTable = ({ consignments, products = [], shops = [], onConfirmPayment, onToggleNoDue }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [togglingNoDueId, setTogglingNoDueId] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "bg-green-100 text-green-700";
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "Settled":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (consignments.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                <p className="text-gray-500">No drop-offs yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Shop Name</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Product</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Dropped</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Sold</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Remaining</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Confirm Payment</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {consignments.map((consignment, idx) => {
                            const shop = shops.find(item => sameId(item.id, consignment.shopId));
                            const product = products.find(item => sameId(item.id, consignment.productId));

                            return (
                                <tr
                                    key={consignment.id}
                                    className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 cursor-pointer transition`}
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">{shop?.name || "Unknown shop"}</td>
                                    <td className="px-6 py-4 text-gray-700">{product?.name || "Unknown product"}</td>
                                    <td className="px-6 py-4 text-gray-700">{consignment.quantityDropped}</td>
                                    <td className="px-6 py-4 text-gray-700">{consignment.quantitySold}</td>
                                    <td className="px-6 py-4 text-gray-700">{consignment.quantityRemaining}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(consignment.status)}`}>
                                            {consignment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div>
                                                {consignment.paymentConfirmed ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Confirmed</span>
                                                ) : (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (typeof onConfirmPayment === "function") {
                                                                setConfirmingId(consignment.id);
                                                                try {
                                                                    await onConfirmPayment(consignment);
                                                                } catch (err) {
                                                                    // ignore - parent will handle errors
                                                                } finally {
                                                                    setConfirmingId(null);
                                                                }
                                                            }
                                                        }}
                                                        disabled={confirmingId === consignment.id || consignment.status !== "Settled"}
                                                        className={`px-3 py-1 rounded-md text-xs font-medium ${consignment.status !== "Settled" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-[#2D6A4F] text-white hover:bg-[#24563f]"}`}
                                                    >
                                                        {confirmingId === consignment.id ? "Confirming..." : consignment.status === "Settled" ? "Confirm Payment" : "Awaiting Settlement"}
                                                    </button>
                                                )}
                                            </div>

                                            {/* No due indicator: show when nothing sold */}
                                            {/* No due checkbox - makers can mark shop as paid till date */}
                                            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(consignment.noDue)}
                                                        onChange={async (e) => {
                                                            e.stopPropagation();
                                                            if (typeof onToggleNoDue === "function") {
                                                                setTogglingNoDueId(consignment.id);
                                                                try {
                                                                    await onToggleNoDue(consignment, e.target.checked);
                                                                } catch (err) {
                                                                    // parent handles errors
                                                                } finally {
                                                                    setTogglingNoDueId(null);
                                                                }
                                                            }
                                                        }}
                                                        disabled={togglingNoDueId === consignment.id}
                                                        className="w-4 h-4 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                                                    />
                                                    <span>{togglingNoDueId === consignment.id ? "Updating..." : "No due"}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setExpandedId(expandedId === consignment.id ? null : consignment.id)}
                                            className="text-[#2D6A4F] font-medium hover:underline text-xs"
                                        >
                                            {expandedId === consignment.id ? "Hide" : "View Details"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Expanded details */}
            {expandedId && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Dropped On</p>
                            <p className="font-semibold text-gray-900">
                                {consignments.find(c => c.id === expandedId)?.droppedOn}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Split %</p>
                            <p className="font-semibold text-gray-900">
                                {consignments.find(c => c.id === expandedId)?.splitPercentage}%
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-gray-600 mb-1">Notes</p>
                            <p className="font-semibold text-gray-900">
                                {consignments.find(c => c.id === expandedId)?.notes || "No notes"}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsignmentTable;
