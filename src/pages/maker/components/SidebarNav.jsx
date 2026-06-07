const SidebarNav = ({ activeSection, onSectionChange, maker, onEditProfile }) => {
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "products", label: "My Products", icon: "📦" },
        { id: "consignments", label: "Consignments", icon: "🚚" },
        { id: "requests", label: "Incoming Requests", icon: "📩" },
        { id: "earnings", label: "Sales & Earnings", icon: "💰" },
        { id: "shops", label: "Find Shops", icon: "🏪" },
        { id: "freelancers", label: "Hire Freelancer", icon: "👥" },
    ];

    const handleEditProfile = () => {
        if (typeof onEditProfile === "function") {
            onEditProfile();
        }
    };

    return (
        <aside className="w-full lg:w-64 flex flex-col">
            {/* Logo */}
            <div className="bg-white rounded-[12px] border border-gray-200 p-4 mb-6">
                <h1 className="text-xl font-bold text-[#2D6A4F]">🟢 LocalLift</h1>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-[12px] border border-gray-200 p-3 sm:p-4 mb-6 flex-1">
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={() => onSectionChange(item.id)}
                                className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg transition text-sm font-medium ${activeSection === item.id
                                    ? "bg-[#2D6A4F] text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Profile Card */}
            <div className="bg-white rounded-[12px] border border-gray-200 overflow-hidden">
                {maker.coverImageUrl && (
                    <div
                        className="h-28 bg-cover bg-center"
                        style={{ backgroundImage: `url(${maker.coverImageUrl})` }}
                    />
                )}
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={maker.photoUrl}
                            alt={maker.name}
                            className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{maker.name}</p>
                            <p className="text-xs text-gray-600">Maker • {maker.location}</p>
                            {maker.businessName && maker.businessName !== maker.name && (
                                <p className="text-xs text-gray-500">{maker.businessName}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mb-4 text-xs">
                        <span>⭐</span>
                        <span className="font-semibold text-gray-900">{maker.rating} rating</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleEditProfile}
                        className="w-full px-3 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default SidebarNav;
