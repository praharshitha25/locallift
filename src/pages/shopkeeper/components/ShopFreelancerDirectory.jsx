import { useState } from "react";

const ShopFreelancerDirectory = ({ freelancers, onHire }) => {
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const saved = await onHire?.(selectedFreelancer, description);

        if (saved) {
            setSubmitted(true);
        } else {
            setError("Could not send hire request. Please try again.");
        }

        setIsSubmitting(false);
    };

    if (freelancers.length === 0) {
        return (
            <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">
                No freelancers found yet.
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {freelancers.map(freelancer => (
                    <div key={freelancer.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-6 text-center border-b border-gray-200">
                            <img
                                src={freelancer.photoUrl || freelancer.photo || freelancer.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name || "Freelancer")}&background=2D6A4F&color=fff`}
                                alt={freelancer.name}
                                className="w-16 h-16 rounded-full mx-auto mb-3 border"
                            />
                            <h3 className="font-bold text-lg text-gray-900">{freelancer.name || freelancer.email || "Freelancer"}</h3>
                            <p className="text-sm text-gray-600">INR {freelancer.ratePerGig || 0} per gig</p>
                        </div>
                        <div className="p-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(freelancer.skills || ["Local promotions"]).map(skill => (
                                    <span key={skill} className="px-2 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <a
                                href={freelancer.portfolio || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-center px-4 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition text-sm font-medium mb-2"
                            >
                                Portfolio
                            </a>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFreelancer(freelancer);
                                    setDescription("");
                                    setSubmitted(false);
                                    setError("");
                                }}
                                className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition text-sm font-medium"
                            >
                                Hire
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFreelancer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[12px] shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Hire {selectedFreelancer.name}</h3>
                            <button type="button" onClick={() => setSelectedFreelancer(null)} className="text-2xl text-gray-500">x</button>
                        </div>
                        {submitted ? (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                                Request sent. {selectedFreelancer.name} will receive the job brief.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Describe the promo, photos, reel, poster, or campaign you need..."
                                    required
                                />
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}
                                <button disabled={isSubmitting} className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-400 transition font-medium">
                                    {isSubmitting ? "Sending..." : "Send Hire Request"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ShopFreelancerDirectory;
