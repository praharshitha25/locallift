import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EarningsSummary = ({ sales }) => {
    const parseSaleDate = (sale) => {
        const dateString = sale.date || sale.droppedOn || sale.createdAt || "";
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    const datedSales = sales
        .map((sale) => ({
            ...sale,
            dateObj: parseSaleDate(sale)
        }))
        .filter((sale) => sale.dateObj);

    const endDate = datedSales.reduce(
        (latest, sale) => (sale.dateObj > latest ? sale.dateObj : latest),
        new Date()
    );

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6);

    const formatDateKey = (date) => date.toISOString().slice(0, 10);

    const allDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });

    const dailyEarnings = new Map(
        allDays.map((date) => [formatDateKey(date), 0])
    );

    datedSales.forEach((sale) => {
        const key = formatDateKey(sale.dateObj);
        if (dailyEarnings.has(key)) {
            dailyEarnings.set(key, dailyEarnings.get(key) + Number(sale.makerCut || 0));
        }
    });

    const weeklyData = allDays.map((date) => ({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        earnings: dailyEarnings.get(formatDateKey(date)) || 0
    }));

    const totalThisWeek = weeklyData.reduce((sum, day) => sum + day.earnings, 0);
    const totalThisMonth = datedSales
        .filter((sale) => {
            const monthAgo = new Date(endDate);
            monthAgo.setDate(endDate.getDate() - 29);
            return sale.dateObj >= monthAgo && sale.dateObj <= endDate;
        })
        .reduce((sum, sale) => sum + Number(sale.makerCut || 0), 0);
    const totalEarned = datedSales.reduce((sum, sale) => sum + Number(sale.makerCut || 0), 0);
    const pendingPayout = totalEarned;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Week</p>
                    <p className="text-3xl font-bold text-[#2D6A4F]">₹{totalThisWeek.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">This Month</p>
                    <p className="text-3xl font-bold text-[#2D6A4F]">₹{totalThisMonth.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">Pending Payout</p>
                    <p className="text-3xl font-bold text-[#D97706]">₹{pendingPayout.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">Total Earned</p>
                    <p className="text-3xl font-bold text-gray-900">₹{totalEarned.toLocaleString()}</p>
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
                            formatter={(value) => `₹${value}`}
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
                                <p className="text-lg font-bold text-[#2D6A4F]">+₹{sale.makerCut}</p>
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
