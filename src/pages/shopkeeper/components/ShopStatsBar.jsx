const ShopStatsBar = ({ inventory, pendingRequests, sales, amountOwed }) => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantityRemaining, 0);
    const salesThisWeek = sales.reduce((sum, sale) => sum + Number(sale.quantitySold || 0), 0);

    const stats = [
        {
            label: "Total Inventory",
            value: `${totalItems} units`,
            color: "bg-green-50",
            textColor: "text-green-700"
        },
        {
            label: "Pending Requests",
            value: `${pendingRequests.length} new`,
            color: "bg-orange-50",
            textColor: "text-orange-700"
        },
        {
            label: "Sales This Week",
            value: `${salesThisWeek} sold`,
            color: "bg-green-50",
            textColor: "text-green-700"
        },
        {
            label: "Amount Owed to Makers",
            value: `INR ${amountOwed.toLocaleString()}`,
            color: "bg-orange-50",
            textColor: "text-orange-700"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(stat => (
                <div key={stat.label} className={`${stat.color} rounded-[12px] border border-gray-200 p-5 shadow-sm`}>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );
};

export default ShopStatsBar;
