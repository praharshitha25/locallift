import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EarningsSummary = ({ sales }) => {
    const weeklyData = [
        { day: "Mon", earnings: 320 },
        { day: "Tue", earnings: 240 },
        { day: "Wed", earnings: 160 },
        { day: "Thu", earnings: 480 },
        { day: "Fri", earnings: 600 },
        { day: "Sat", earnings: 720 },
        { day: "Sun", earnings: 280 }
    ];

    const totalThisWeek = weeklyData.reduce((sum, day) => sum + day.earnings, 0);
    const totalThisMonth = totalThisWeek * 4;
    const pendingPayout = sales
        .filter(sale => sale.date >= "2026-05-20")
        .reduce((acc, sale) => acc + Number(sale.makerCut || 0), 0);
    const totalEarned = 8200;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Week</p>
                    <p className="text-3xl font-bold text-[#2D6A4F]">INR {totalThisWeek.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
                    <p className="text-3xl font-bold text-[#2D6A4F]">INR {totalThisMonth.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">Pending Payout</p>
                    <p className="text-3xl font-bold text-[#D97706]">INR {pendingPayout.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Earned</p>
                    <p className="text-3xl font-bold text-gray-900">INR {totalEarned.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Earnings</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px"
                            }}
                            formatter={(value) => `INR ${value}`}
                        />
                        <Bar dataKey="earnings" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sales</h3>
                {sales.length === 0 ? (
                    <p className="text-gray-500">No sales yet. Log a drop-off to start tracking earnings.</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sales.map((sale, idx) => (
                            <div key={sale.id || idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{sale.productName}</p>
                                    <p className="text-xs text-gray-600">{sale.shopName} | {sale.quantitySold} units | {sale.date}</p>
                                </div>
                                <p className="text-lg font-bold text-[#2D6A4F]">+INR {sale.makerCut}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center pt-4">
                <Link to="/settlement" className="inline-block px-6 py-3 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium">
                    View Settlement Report
                </Link>
            </div>
        </div>
    );
};

export default EarningsSummary;
