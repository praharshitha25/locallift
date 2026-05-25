import { useState } from "react";

const fallbackImage = (product) => {
    const label = encodeURIComponent(product?.category || "Product");
    const name = encodeURIComponent(product?.name || "LocalLift");

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f0f5f3'/%3E%3Ccircle cx='492' cy='82' r='72' fill='%23d97706' fill-opacity='.22'/%3E%3Ccircle cx='116' cy='326' r='96' fill='%232d6a4f' fill-opacity='.18'/%3E%3Ctext x='50%25' y='46%25' text-anchor='middle' fill='%232d6a4f' font-family='Inter, Arial, sans-serif' font-size='30' font-weight='700'%3E${name}%3C/text%3E%3Ctext x='50%25' y='57%25' text-anchor='middle' fill='%236b7280' font-family='Inter, Arial, sans-serif' font-size='18'%3E${label}%3C/text%3E%3C/svg%3E`;
};

const ProductGrid = ({ products, onDelete, onEdit }) => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleEdit = (product) => {
        setEditingId(product.id);
        setEditData(product);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEdit = () => {
        onEdit({
            ...editData,
            wholesalePrice: Number(editData.wholesalePrice) || 0,
            retailPrice: Number(editData.retailPrice) || 0,
            quantity: Number(editData.quantity) || 0
        });
        setEditingId(null);
    };

    if (products.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-[12px] border border-gray-200">
                <p className="text-gray-500">No products yet. Add your first product to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
                <div key={product.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbackImage(product);
                            }}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="p-4">
                        {editingId === product.id ? (
                            <div className="space-y-3">
                                <input
                                    name="name"
                                    value={editData.name || ""}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    aria-label="Product name"
                                />
                                <select
                                    name="category"
                                    value={editData.category || "Craft"}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                >
                                    <option>Food</option>
                                    <option>Craft</option>
                                    <option>Art</option>
                                    <option>Clothing</option>
                                    <option>Other</option>
                                </select>
                                <textarea
                                    name="description"
                                    value={editData.description || ""}
                                    onChange={handleEditChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    aria-label="Product description"
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        name="wholesalePrice"
                                        type="number"
                                        value={editData.wholesalePrice || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                        aria-label="Wholesale price"
                                    />
                                    <input
                                        name="retailPrice"
                                        type="number"
                                        value={editData.retailPrice || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                        aria-label="Retail price"
                                    />
                                    <input
                                        name="quantity"
                                        type="number"
                                        value={editData.quantity || ""}
                                        onChange={handleEditChange}
                                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                                        aria-label="Stock quantity"
                                    />
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="flex-1 px-3 py-2 text-sm bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-700"
                                        }`}>
                                        {product.status}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Wholesale:</span>
                                        <span className="font-semibold text-gray-900">INR {product.wholesalePrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Retail:</span>
                                        <span className="font-semibold text-gray-900">INR {product.retailPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Stock:</span>
                                        <span className="font-semibold text-gray-900">{product.quantity} units</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="flex-1 px-3 py-2 text-sm border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;
