const StatsBar = ({ products, consignments, sales }) => {
    const totalProducts = products.length;
    const activeConsignments = consignments.filter(c => c.status === "Active").length;
    const unitsSoldThisWeek = sales.reduce((acc, sale) => acc + sale.quantitySold, 0);
    const pendingEarnings = sales.reduce((acc, sale) => acc + sale.makerCut, 0);

    const stats = [
        {
            label: "Total Products Listed",
            value: totalProducts,
            color: "bg-green-50",
            textColor: "text-green-700",
            icon: "📦"
        },
        {
            label: "Active Consignments",
            value: activeConsignments,
            color: "bg-orange-50",
            textColor: "text-orange-700",
            icon: "🏪"
        },
        {
            label: "Units Sold This Week",
            value: unitsSoldThisWeek,
            color: "bg-green-50",
            textColor: "text-green-700",
            icon: "📊"
        },
        {
            label: "Earnings Pending",
            value: `₹${pendingEarnings.toLocaleString()}`,
            color: "bg-orange-50",
            textColor: "text-orange-700",
            icon: "💰"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div key={idx} className={`${stat.color} rounded-[12px] p-6 border border-gray-200`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                        </div>
                        <span className="text-2xl">{stat.icon}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsBar;