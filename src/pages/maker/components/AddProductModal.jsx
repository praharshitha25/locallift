import { useState } from "react";
import { X } from "lucide-react";
import { uploadToCloudinary } from "../../../lib/cloudinary";

const AddProductModal = ({ makerId, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: "",
        category: "Craft",
        wholesalePrice: "",
        retailPrice: "",
        quantity: "",
        description: "",
        imageUrl: "https://images.unsplash.com/photo-1609042231775-52ec8b5c3b5d?w=600&auto=format&fit=crop"
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(formData.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === "wholesalePrice" || name === "retailPrice" || name === "quantity"
                ? parseInt(value, 10) || ""
                : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.wholesalePrice || !formData.retailPrice || !formData.quantity) {
            setError("All required fields must be filled.");
            return;
        }

        const quantity = Number(formData.quantity);
        const wholesale = Number(formData.wholesalePrice);
        const retail = Number(formData.retailPrice);

        if (quantity <= 0) {
            setError("Quantity must be greater than 0.");
            return;
        }

        if (wholesale <= 0) {
            setError("Wholesale price must be greater than 0.");
            return;
        }

        if (retail <= 0) {
            setError("Retail price must be greater than 0.");
            return;
        }

        if (retail < wholesale) {
            setError("Retail price must be greater than or equal to wholesale price.");
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = formData.imageUrl;

            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }

            const product = {
                ...formData,
                imageUrl,
                makerId,
                status: "Active"
            };

            await onSubmit(product);
        } catch (err) {
            setError(err.message || "Could not save product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[12px] shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="e.g., Handmade Resin Coasters"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                        >
                            <option>Food</option>
                            <option>Craft</option>
                            <option>Art</option>
                            <option>Clothing</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price (INR) *</label>
                            <input
                                type="number"
                                name="wholesalePrice"
                                value={formData.wholesalePrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                placeholder="100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price (INR) *</label>
                            <input
                                type="number"
                                name="retailPrice"
                                value={formData.retailPrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                placeholder="200"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                            placeholder="Describe your product..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                        <label className="w-full min-h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-50 transition">
                            <img src={previewUrl} alt="Product preview" className="w-full h-40 object-cover" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                            />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Select an image to preview locally. It uploads when you submit.</p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

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
                            {isSubmitting ? "Saving..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
