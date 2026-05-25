const FreelancerDirectory = ({ freelancers }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map(freelancer => (
                <div key={freelancer.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    {/* Profile */}
                    <div className="bg-gradient-to-r from-[#2D6A4F] to-[#D97706] p-6 text-white text-center">
                        <img
                            src={freelancer.image}
                            alt={freelancer.name}
                            className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-white"
                        />
                        <h3 className="font-bold text-lg">{freelancer.name}</h3>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                        <div className="mb-4">
                            <p className="text-xs text-gray-600 font-medium mb-2">SKILLS</p>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-full text-xs font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-gray-600 text-xs font-medium mb-1">RATE PER GIG</p>
                            <p className="text-2xl font-bold text-[#2D6A4F]">₹{freelancer.ratePerGig}</p>
                        </div>

                        <div className="space-y-2">
                            <a
                                href={freelancer.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full px-4 py-2 text-center border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm"
                            >
                                View Portfolio
                            </a>
                            <button className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium text-sm">
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FreelancerDirectory;