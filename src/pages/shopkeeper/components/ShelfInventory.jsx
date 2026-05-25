import { getInventoryStatus } from "./shopDataHelpers";

const ShelfInventory = ({ inventory, onLogSale }) => {
    if (inventory.length === 0) {
        return (
            <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                No accepted shelf inventory yet.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Image</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Product Name</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Maker</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Dropped</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Sold</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Remaining</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Retail</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Split</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item, idx) => {
                            const status = getInventoryStatus(item.quantityRemaining);

                            return (
                                <tr key={item.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} border-b border-gray-200`}>
                                    <td className="px-5 py-3">
                                        <img
                                            src={item.product?.image}
                                            alt={item.product?.name || "Product"}
                                            className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                        />
                                    </td>
                                    <td className="px-5 py-3 font-semibold text-gray-900">{item.product?.name || "Unknown Product"}</td>
                                    <td className="px-5 py-3 text-gray-700">{item.maker?.name || "Unknown Maker"}</td>
                                    <td className="px-5 py-3 text-gray-700">{item.quantityDropped}</td>
                                    <td className="px-5 py-3 text-gray-700">{item.quantitySold}</td>
                                    <td className={`px-5 py-3 font-bold ${status.textClassName}`}>{item.quantityRemaining}</td>
                                    <td className="px-5 py-3 text-gray-700">INR {item.product?.retailPrice || "-"}</td>
                                    <td className="px-5 py-3 text-gray-700">{item.makerPercent}/{item.shopPercent}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <button
                                            type="button"
                                            onClick={() => onLogSale(item)}
                                            disabled={item.quantityRemaining <= 0}
                                            className="px-3 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-300 transition font-medium"
                                        >
                                            Log Sale
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShelfInventory;
