import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Navbar from "../../components/Navbar";
import ProfileForm from "../../components/ProfileForm";
import { db } from "../../firebase/config";
import { useAuth } from "../../auth/AuthContext";
import { emptyConstraints, useCollection } from "../../firebase/firestoreHooks";
import { uploadToCloudinary } from "../../lib/cloudinary";

const completedGigs = [
    { id: "c1", brandName: "Cornerstone Gifts", jobType: "Instagram Reels", amountPaid: 1500, date: "2026-05-20" },
    { id: "c2", brandName: "The Little Store", jobType: "Product Photography", amountPaid: 2000, date: "2026-05-21" },
    { id: "c3", brandName: "Sarah K.", jobType: "Social Media Management", amountPaid: 3000, date: "2026-05-22" }
];

const weeklyEarnings = [
    { day: "Mon", earnings: 800 },
    { day: "Tue", earnings: 1200 },
    { day: "Wed", earnings: 500 },
    { day: "Thu", earnings: 1600 },
    { day: "Fri", earnings: 900 },
    { day: "Sat", earnings: 1400 },
    { day: "Sun", earnings: 700 }
];

const FreelancerDashboard = () => {
    const { currentUser, userDoc } = useAuth();
    const uid = currentUser?.uid;
    const currentFreelancer = {
        id: uid,
        name: userDoc?.name || currentUser?.displayName || currentUser?.email || "Freelancer",
        email: userDoc?.email || currentUser?.email || "",
        location: userDoc?.location || "Kurnool",
        brandName: userDoc?.brandName || userDoc?.shopName || userDoc?.name || "Freelancer",
        photoUrl: userDoc?.photoURL || userDoc?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDoc?.name || "Freelancer")}&background=2D6A4F&color=fff`,
        rating: userDoc?.rating || "New"
    };
    const [activeSection, setActiveSection] = useState("dashboard");
    const [selectedGig, setSelectedGig] = useState(null);
    const [applyMessage, setApplyMessage] = useState("");
    const [applySubmitted, setApplySubmitted] = useState(false);
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [portfolioForm, setPortfolioForm] = useState({ title: "", brand: "", location: "Kurnool", description: "" });
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [actionError, setActionError] = useState("");
    const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
    const [portfolioPreview, setPortfolioPreview] = useState("");
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveMessage, setProfileSaveMessage] = useState("");
    const [profileSaveError, setProfileSaveError] = useState("");
    const portfolioQuery = useMemo(() => uid ? [where("freelancerId", "==", uid)] : emptyConstraints, [uid]);
    const myGigsQuery = useMemo(() => uid ? [where("freelancerId", "==", uid)] : emptyConstraints, [uid]);
    const openGigsQuery = useMemo(() => uid ? [where("status", "==", "Open")] : emptyConstraints, [uid]);

    const { items: portfolios, loading: portfoliosLoading, error: portfoliosError } = useCollection("portfolios", portfolioQuery, Boolean(uid));
    const { items: myGigs, loading: myGigsLoading, error: myGigsError } = useCollection("gigs", myGigsQuery, Boolean(uid));
    const { items: openGigs, loading: openGigsLoading, error: openGigsError } = useCollection("gigs", openGigsQuery, Boolean(uid));
    const loading = portfoliosLoading || myGigsLoading || openGigsLoading;
    const dataError = portfoliosError || myGigsError || openGigsError;

    useEffect(() => {
        document.title = "Freelancer Dashboard — Local Lift";
    }, []);

    // Profile form is optional - users can click Edit Profile button to fill it out
    // No automatic prompt on login

    const saveProfileData = async (profileData) => {
        setProfileSaveError("");
        setProfileSaveMessage("");
        setIsSavingProfile(true);

        try {
            await setDoc(doc(db, "users", uid), {
                ...profileData,
                profileComplete: true,
                updatedAt: serverTimestamp()
            }, { merge: true });
            setProfileSaveMessage("Profile updated successfully!");
            setShowProfileForm(false);
            setTimeout(() => setProfileSaveMessage(""), 3000);
        } catch (err) {
            setProfileSaveError(err.message || "Could not save profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const completedGigsFromFirestore = myGigs.filter(gig => gig.status === "Completed");
    const activeGigs = myGigs.filter(gig => gig.status !== "Completed");
    const earningsThisWeek = completedGigsFromFirestore.reduce((sum, gig) => sum + Number(gig.budget || 0), 0);
    const earningsThisMonth = earningsThisWeek * 4;
    const totalEarned = completedGigsFromFirestore.reduce((sum, gig) => sum + Number(gig.budget || 0), 0);
    const pending = activeGigs.reduce((sum, gig) => sum + Number(gig.budget || 0), 0);

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "portfolio", label: "Portfolio" },
        { id: "gigs", label: "Available Projects", badge: activeGigs.length },
        { id: "earnings", label: "Earnings" }
    ];

    const stats = [
        { label: "Active Projects", value: myGigs.length, color: "bg-green-50", textColor: "text-green-700" },
        { label: "Completed Projects", value: completedGigsFromFirestore.length, color: "bg-white", textColor: "text-gray-900" },
        { label: "Earnings This Week", value: `INR ${earningsThisWeek.toLocaleString()}`, color: "bg-orange-50", textColor: "text-orange-700" },
        { label: "Portfolio Items", value: portfolios.length, color: "bg-green-50", textColor: "text-green-700" }
    ];

    const handlePortfolioChange = (e) => {
        const { name, value } = e.target;
        setPortfolioForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSavePortfolio = async (e) => {
        e.preventDefault();
        setActionError("");
        setIsSavingPortfolio(true);

        try {
            let thumbnail = "";

            if (portfolioFile) {
                thumbnail = await uploadToCloudinary(portfolioFile);
            }

            const newItem = {
                ...portfolioForm,
                thumbnail,
                freelancerId: uid,
                freelancerName: currentFreelancer.name
            };

            await addDoc(collection(db, "portfolios"), {
                ...newItem,
                createdAt: serverTimestamp()
            });

            setPortfolioForm({ title: "", brand: "", location: "Kurnool", description: "" });
            setPortfolioFile(null);
            setPortfolioPreview("");
            setShowPortfolioModal(false);
        } catch (err) {
            setActionError(err.message || "Could not save portfolio item.");
        } finally {
            setIsSavingPortfolio(false);
        }
    };

    const handleApplyToGig = async (e) => {
        e.preventDefault();
        setActionError("");

        try {
            await updateDoc(doc(db, "gigs", selectedGig.id), {
                status: "Applied",
                applicationMessage: applyMessage,
                freelancerId: uid,
                freelancerName: currentFreelancer.name,
                appliedAt: serverTimestamp()
            });
            setApplySubmitted(true);
        } catch (err) {
            setActionError(err.message || "Could not send application.");
        }
    };

    const renderStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(stat => (
                <div key={stat.label} className={`${stat.color} rounded-[12px] border border-gray-200 p-5 shadow-sm`}>
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
            ))}
        </div>
    );

    const renderPortfolio = () => (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                <button onClick={() => setShowPortfolioModal(true)} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium">
                    Add Portfolio Item
                </button>
            </div>
            {portfolios.length === 0 ? (
                <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">Add your first portfolio item to get started.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {portfolios.map(item => (
                        <article key={item.id} className="bg-white rounded-[12px] border border-gray-200 overflow-hidden shadow-sm">
                            {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="w-full h-44 object-cover bg-gray-100" />
                            ) : (
                                <div className="w-full h-44 bg-gray-100" />
                            )}
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.brand}</p>
                                <p className="text-xs text-gray-500 mb-3">{item.location || "Kurnool"}</p>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.description}</p>
                                <button className="w-full px-4 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm">
                                    View
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );

    const renderGigs = () => (
        <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Projects</h2>
            {openGigs.length === 0 ? (
                <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">No projects available right now</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {openGigs.map(gig => (
                        <article key={gig.id} className="bg-white rounded-[12px] border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{gig.businessName}</h3>
                                    <p className="text-sm text-gray-600">{gig.jobType}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">{gig.location}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p className="text-gray-500">Budget</p>
                                    <p className="font-semibold text-gray-900">INR {gig.budget}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Posted</p>
                                    <p className="font-semibold text-gray-900">{gig.postedDate}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedGig(gig);
                                    setApplyMessage("");
                                    setApplySubmitted(false);
                                }}
                                disabled={gig.status === "Applied" || gig.status === "Accepted"}
                                className="px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium"
                            >
                                {gig.status === "Applied" ? "Applied" : gig.status === "Accepted" ? "Accepted" : "Apply"}
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );

    const renderEarnings = () => (
        <section className="space-y-6">
            <div className="flex justify-end">
                <Link to="/settlement" className="px-4 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium">
                    View Settlement Report
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    ["This Week", earningsThisWeek],
                    ["This Month", earningsThisMonth],
                    ["Total Earned", totalEarned],
                    ["Pending", pending]
                ].map(([label, value]) => (
                    <div key={label} className="bg-white rounded-[12px] border border-gray-200 p-5">
                        <p className="text-sm text-gray-600 mb-1">{label}</p>
                        <p className={`text-3xl font-bold ${label === "Pending" ? "text-[#D97706]" : "text-[#2D6A4F]"}`}>INR {value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Earnings</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={weeklyEarnings}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => `INR ${value}`} />
                        <Bar dataKey="earnings" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[12px] border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Projects</h2>
                <div className="space-y-3">
                    {completedGigs.map(gig => (
                        <div key={gig.id} className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4">
                            <div>
                                <p className="font-semibold text-gray-900">{gig.brandName}</p>
                                <p className="text-xs text-gray-600">{gig.jobType} | {gig.date}</p>
                            </div>
                            <p className="font-bold text-[#2D6A4F]">INR {gig.amountPaid}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );

    const renderSection = () => {
        if (loading) {
            return <div className="bg-white rounded-[12px] border border-gray-200 p-10 text-center text-gray-500">Loading freelancer data...</div>;
        }

        switch (activeSection) {
            case "dashboard":
                return <div className="space-y-6">{renderStats()}{renderGigs()}{renderPortfolio()}</div>;
            case "portfolio":
                return renderPortfolio();
            case "gigs":
                return renderGigs();
            case "earnings":
                return renderEarnings();
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0]">
            <Navbar />

            {/* Show profile form if needed */}
            {showProfileForm && (
                <ProfileForm
                    role="freelancer"
                    initialData={userDoc || {}}
                    onSave={saveProfileData}
                    isSaving={isSavingProfile}
                    message="Complete your profile to get started"
                    onCancel={() => setShowProfileForm(false)}
                />
            )}

            {/* Show dashboard if profile is complete */}
            {!showProfileForm && (
                <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
                    <aside className="w-full lg:w-64 flex flex-col">
                        <div className="bg-white rounded-[12px] border border-gray-200 p-4 mb-6">
                            <h1 className="text-xl font-bold text-[#2D6A4F]">Local Lift</h1>
                        </div>
                        <nav className="bg-white rounded-[12px] border border-gray-200 p-3 mb-6 flex-1">
                            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                                {navItems.map(item => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSection(item.id)}
                                            className={`w-full flex items-center justify-between text-left px-3 py-3 rounded-lg transition text-sm font-medium ${activeSection === item.id ? "bg-[#2D6A4F] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                        >
                                            <span>{item.label}</span>
                                            {item.badge > 0 && <span className="ml-2 rounded-full bg-[#F4A261] px-2 py-0.5 text-xs font-bold text-white">{item.badge}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="bg-white rounded-[12px] border border-gray-200 p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={currentFreelancer.photoUrl} alt={currentFreelancer.name} className="w-12 h-12 rounded-full bg-gray-100" />
                                <div>
                                    <p className="font-bold text-gray-900">{currentFreelancer.name}</p>
                                    <p className="text-xs text-gray-600">Freelancer | {currentFreelancer.location}</p>
                                    <p className="text-xs text-gray-500">{currentFreelancer.brandName}</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 mb-4">{currentFreelancer.rating} rating</p>
                            <button
                                type="button"
                                onClick={() => setShowProfileForm(true)}
                                className="w-full px-3 py-2 border border-[#2D6A4F] text-[#2D6A4F] rounded-lg hover:bg-[#f0f5f3] transition font-medium text-sm"
                            >Edit Profile</button>
                        </div>
                    </aside>

                    <main className="flex-1 space-y-6">
                        {dataError && <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{dataError}</div>}
                        {profileSaveMessage && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{profileSaveMessage}</div>}
                        {profileSaveError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileSaveError}</div>}
                        {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}
                        {activeSection !== "dashboard" && !loading && renderStats()}
                        {renderSection()}
                    </main>
                </div>
            )}

            {selectedGig && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[12px] shadow-lg w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Apply to Project</h2>
                            <button type="button" onClick={() => setSelectedGig(null)} className="text-2xl text-gray-500">x</button>
                        </div>
                        {applySubmitted ? (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">Application sent to {selectedGig.businessName}.</div>
                        ) : (
                            <form onSubmit={handleApplyToGig} className="space-y-4">
                                <div className="rounded-lg bg-[#F5F5F0] border p-4">
                                    <p className="font-bold text-gray-900">{selectedGig.jobType}</p>
                                    <p className="text-sm text-gray-600">{selectedGig.businessName} | INR {selectedGig.budget}</p>
                                </div>
                                <textarea value={applyMessage} onChange={(e) => setApplyMessage(e.target.value)} rows="5" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" placeholder="Write a short pitch..." />
                                <button className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium">Send Application</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {showPortfolioModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[12px] shadow-lg w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Add Portfolio Item</h2>
                            <button type="button" onClick={() => setShowPortfolioModal(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSavePortfolio} className="space-y-4">
                            <input name="title" value={portfolioForm.title} onChange={handlePortfolioChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Project title" />
                            <input name="brand" value={portfolioForm.brand} onChange={handlePortfolioChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Brand name" />
                            <input name="location" value={portfolioForm.location} onChange={handlePortfolioChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Location" />
                            {portfolioPreview && <img src={portfolioPreview} alt="Portfolio preview" className="w-full h-40 object-cover rounded-lg bg-gray-100" />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setPortfolioFile(file);
                                    setPortfolioPreview(file ? URL.createObjectURL(file) : "");
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <textarea name="description" value={portfolioForm.description} onChange={handlePortfolioChange} required rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Description" />
                            <button disabled={isSavingPortfolio} className="w-full px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-400 transition font-medium">
                                {isSavingPortfolio ? "Saving..." : "Save Portfolio Item"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreelancerDashboard;
