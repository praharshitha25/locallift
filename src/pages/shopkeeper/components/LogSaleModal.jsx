import { useMemo, useState } from "react";

const LogSaleModal = ({ item, onClose, onConfirm }) => {
    const [quantitySold, setQuantitySold] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const quantity = Number(quantitySold || 0);
    const retailPrice = Number(item.product?.retailPrice || 0);
    const totalRevenue = quantity * retailPrice;
    const makerCut = Math.round(totalRevenue * (item.makerPercent / 100));
    const shopProfit = totalRevenue - makerCut;

    const canSubmit = useMemo(() => quantity > 0 && quantity <= item.quantityRemaining, [quantity, item.quantityRemaining]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (quantity > item.quantityRemaining) {
            setError("Quantity sold cannot exceed units remaining.");
            return;
        }

        if (quantity <= 0) {
            setError("Enter at least 1 unit sold.");
            return;
        }

        setIsSubmitting(true);
        const saved = await onConfirm(item, {
            quantitySold: quantity,
            totalRevenue,
            makerCut,
            shopProfit
        });
        if (!saved) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[12px] shadow-lg w-full max-w-lg">
                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Log Sale</h2>
                    <button type="button" onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">x</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex gap-4">
                        <img
                            src={item.product?.image}
                            alt={item.product?.name || "Product"}
                            className="w-24 h-24 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                            <p className="text-sm text-gray-500">Product</p>
                            <p className="font-bold text-gray-900">{item.product?.name || "Unknown Product"}</p>
                            <p className="text-sm text-gray-600">Maker: {item.maker?.name || "Unknown Maker"}</p>
                            <p className="text-sm text-gray-600">Units Currently on Shelf: {item.quantityRemaining}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Sold</label>
                        <input
                            type="number"
                            min="1"
                            max={item.quantityRemaining}
                            value={quantitySold}
                            onChange={(e) => setQuantitySold(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="5"
                        />
                    </div>

                    <div className="bg-[#F5F5F0] rounded-lg p-4 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Units Sold:</span>
                            <strong>{quantity}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Retail Price:</span>
                            <strong>INR {retailPrice}</strong>
                        </div>
                        <div className="border-t border-gray-300 pt-2 flex justify-between">
                            <span>Total Revenue:</span>
                            <strong>INR {totalRevenue}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Your Profit ({item.shopPercent}%):</span>
                            <strong className="text-[#2D6A4F]">INR {shopProfit}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Maker's Cut ({item.makerPercent}%):</span>
                            <strong className="text-[#D97706]">INR {makerCut}</strong>
                        </div>
                    </div>

                    {(error || quantity > item.quantityRemaining) && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error || "Quantity sold cannot exceed units remaining."}
                        </div>
                    )}

                    <div className="flex gap-3 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="flex-1 px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-400 transition font-medium"
                        >
                            {isSubmitting ? "Saving..." : "Confirm Sale"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogSaleModal;
