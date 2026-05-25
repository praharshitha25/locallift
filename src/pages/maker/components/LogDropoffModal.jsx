import { useState } from "react";

const sameId = (left, right) => String(left) === String(right);

const LogDropoffModal = ({ products, shops, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        shopId: shops[0]?.id || "",
        productId: products[0]?.id || "",
        quantityDropped: "",
        splitPercentage: 50,
        notes: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "quantityDropped" || name === "splitPercentage"
                ? parseInt(value, 10) || ""
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.shopId || !formData.productId || !formData.quantityDropped) {
            return;
        }

        setIsSubmitting(true);
        const saved = await onSubmit(formData);
        if (!saved) {
            setIsSubmitting(false);
        }
    };

    const selectedProduct = products.find(p => sameId(p.id, formData.productId));
    const selectedShop = shops.find(s => sameId(s.id, formData.shopId));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[12px] shadow-lg w-full max-w-lg">
                <div className="border-b border-gray-200 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Log New Drop-off</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        aria-label="Close"
                    >
                        x
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Shop *</label>
                        <select
                            name="shopId"
                            value={formData.shopId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            required
                        >
                            <option value="">Choose a shop...</option>
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>
                                    {shop.name} - {shop.type}
                                </option>
                            ))}
                        </select>
                        {selectedShop && (
                            <p className="text-xs text-gray-500 mt-1">{selectedShop.location} | {selectedShop.shelfSlots} slots available</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            required
                        >
                            <option value="">Choose a product...</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stock: {product.quantity})
                                </option>
                            ))}
                        </select>
                        {selectedProduct && (
                            <p className="text-xs text-gray-500 mt-1">Wholesale: INR {selectedProduct.wholesalePrice} | Retail: INR {selectedProduct.retailPrice}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Dropping Off *</label>
                        <input
                            type="number"
                            name="quantityDropped"
                            value={formData.quantityDropped}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="10"
                            max={selectedProduct?.quantity || 999}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maker's Split % (default 50/50)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                name="splitPercentage"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.splitPercentage}
                                onChange={handleChange}
                                className="flex-1"
                            />
                            <span className="text-lg font-bold text-[#2D6A4F] w-12 text-right">{formData.splitPercentage}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Maker: {formData.splitPercentage}% | Shop: {100 - formData.splitPercentage}%</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="e.g., Display on main shelf, keep at checkout..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-400 transition font-medium"
                        >
                            {isSubmitting ? "Saving..." : "Log Drop-off"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LogDropoffModal;
