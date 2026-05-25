import { Link } from "react-router-dom";

const SettlementSummary = ({ settlements, sales, onMarkPaid }) => {
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalRevenue || Number(sale.makerCut || 0) * 2), 0);
    const totalOwed = settlements.reduce((sum, settlement) => sum + (settlement.paid ? 0 : settlement.amountOwed), 0);
    const netProfit = totalRevenue - totalOwed;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Link
                    to="/settlement"
                    className="px-4 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium"
                >
                    View Settlement Report
                </Link>
            </div>
            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Owed to Makers</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Maker</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Units Sold</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount Owed</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map(row => (
                                <tr key={row.key} className={`border-b border-gray-200 ${row.paid ? "bg-gray-100 text-gray-500" : "bg-white"}`}>
                                    <td className="px-4 py-3 font-medium">{row.makerName}</td>
                                    <td className="px-4 py-3">{row.productName}</td>
                                    <td className="px-4 py-3">{row.unitsSold}</td>
                                    <td className="px-4 py-3 font-bold">INR {row.amountOwed}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.paid ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-700"}`}>
                                            {row.paid ? "Paid ✓" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => onMarkPaid(row)}
                                            disabled={row.paid}
                                            className="px-3 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] disabled:border-gray-300 disabled:text-gray-400 transition font-medium"
                                        >
                                            {row.paid ? "Paid" : "Mark as Paid"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end pt-4 text-lg font-bold text-gray-900">
                    Total owed: INR {totalOwed.toLocaleString()}
                </div>
            </div>

            <div className="bg-white rounded-[12px] border border-gray-200 p-6 shadow-sm max-w-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Earnings</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Revenue This Week:</span>
                        <strong>INR {totalRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Owed to Makers:</span>
                        <strong>INR {totalOwed.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                        <span className="text-gray-600">My Net Profit:</span>
                        <strong className="text-[#2D6A4F] text-xl">INR {netProfit.toLocaleString()}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettlementSummary;
