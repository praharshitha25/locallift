import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { uploadToCloudinary } from "../lib/cloudinary";

const categoryOptions = ["Food", "Craft", "Art", "Clothing", "Other"];
const shopCategories = ["Gift Store", "Fashion & Lifestyle", "Food & Groceries", "Handmade Store", "Natural Products", "Other"];
const freelancerSkills = ["Instagram Reels", "Product Photography", "Graphic Design", "Video Editing", "Social Media Management", "Content Writing", "Other"];
const idProofOptions = {
    maker: ["Aadhaar", "PAN", "Voter ID"],
    freelancer: ["Aadhaar", "Student ID", "PAN", "Voter ID"],
    shopkeeper: ["GST Number", "Shop License", "Udyam/MSME Number", "Other"]
};

const ProfileModal = ({ role, isOpen, initialData, onClose, onSave, message, isSaving }) => {
    const [formData, setFormData] = useState({});
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setFormData({
            name: initialData?.name || "",
            phone: initialData?.phone || "",
            location: initialData?.location || "",
            upiId: initialData?.upiId || "",
            idProofType: initialData?.idProofType || "",
            idProofNumber: initialData?.idProofNumber || "",
            brandName: initialData?.brandName || "",
            productCategories: initialData?.productCategories || [],
            bio: initialData?.bio || "",
            shopName: initialData?.shopName || "",
            shopCategory: initialData?.shopCategory || "",
            shopAddress: initialData?.shopAddress || "",
            businessHours: initialData?.businessHours || "",
            googleMapsLink: initialData?.googleMapsLink || "",
            skills: initialData?.skills || [],
            ratePerGig: initialData?.ratePerGig || "",
            portfolioWebsite: initialData?.portfolioWebsite || "",
            instagramHandle: initialData?.instagramHandle || "",
            photoURL: initialData?.photoURL || initialData?.photoUrl || "",
            photoUrl: initialData?.photoURL || initialData?.photoUrl || ""
        });
        setPhotoFile(null);
        setPhotoPreview(initialData?.photoURL || initialData?.photoUrl || "");
        setError("");
    }, [isOpen, initialData]);

    const proofOptions = useMemo(() => idProofOptions[role] || [], [role]);
    const roleTitle = useMemo(() => {
        if (role === "maker") return "Maker Profile";
        if (role === "shopkeeper") return "Shopkeeper Profile";
        return "Freelancer Profile";
    }, [role]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleCheckbox = (field, value) => {
        setFormData(prev => {
            const values = Array.isArray(prev[field]) ? prev[field] : [];
            return {
                ...prev,
                [field]: values.includes(value)
                    ? values.filter(item => item !== value)
                    : [...values, value]
            };
        });
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.name.trim() || !formData.phone.trim()) {
            setError("Name and phone are required.");
            return;
        }

        try {
            let uploadedPhotoUrl = formData.photoURL || formData.photoUrl || "";
            if (photoFile) {
                uploadedPhotoUrl = await uploadToCloudinary(photoFile);
            }

            const profileData = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                upiId: formData.upiId.trim(),
                idProofType: formData.idProofType,
                idProofNumber: formData.idProofNumber.trim(),
                photoURL: uploadedPhotoUrl,
                photoUrl: uploadedPhotoUrl,
                profileComplete: true
            };

            if (role === "maker") {
                profileData.brandName = formData.brandName.trim();
                profileData.productCategories = formData.productCategories;
                profileData.bio = formData.bio.trim();
            }

            if (role === "shopkeeper") {
                profileData.shopName = formData.shopName.trim();
                profileData.shopCategory = formData.shopCategory;
                profileData.shopAddress = formData.shopAddress.trim();
                profileData.businessHours = formData.businessHours.trim();
                profileData.googleMapsLink = formData.googleMapsLink.trim();
            }

            if (role === "freelancer") {
                profileData.skills = formData.skills;
                profileData.bio = formData.bio.trim();
                profileData.ratePerGig = formData.ratePerGig;
                profileData.portfolioWebsite = formData.portfolioWebsite.trim();
                profileData.instagramHandle = formData.instagramHandle.trim();
            }

            await onSave(profileData);
        } catch (err) {
            setError(err.message || "Could not save profile.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl overflow-y-auto rounded-[16px] bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{roleTitle}</h2>
                        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close profile modal">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                    {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Profile photo</label>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                                    {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-400">?</div>}
                                </div>
                                <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    Upload
                                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full name</label>
                                <input value={formData.name} onChange={(e) => updateField("name", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone number</label>
                                <input value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" required />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {(role === "maker" || role === "freelancer") && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location / Area</label>
                                <input value={formData.location} onChange={(e) => updateField("location", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                            <input value={formData.upiId} onChange={(e) => updateField("upiId", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                        </div>
                    </div>

                    {role === "maker" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand name</label>
                                <input value={formData.brandName} onChange={(e) => updateField("brandName", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID proof type</label>
                                <select value={formData.idProofType} onChange={(e) => updateField("idProofType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                                    <option value="">Select proof</option>
                                    {proofOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {role === "shopkeeper" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Owner full name</label>
                                <input value={formData.name} onChange={(e) => updateField("name", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shop name</label>
                                <input value={formData.shopName} onChange={(e) => updateField("shopName", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        </div>
                    )}

                    {role === "shopkeeper" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shop category</label>
                                <select value={formData.shopCategory} onChange={(e) => updateField("shopCategory", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                                    <option value="">Select category</option>
                                    {shopCategories.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Business hours</label>
                                <input value={formData.businessHours} onChange={(e) => updateField("businessHours", e.target.value)} type="text" placeholder="e.g. 9 AM - 9 PM" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        </div>
                    )}

                    {role === "shopkeeper" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full shop address</label>
                                <textarea value={formData.shopAddress} onChange={(e) => updateField("shopAddress", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Google Maps link (optional)</label>
                                <input value={formData.googleMapsLink} onChange={(e) => updateField("googleMapsLink", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        </div>
                    )}

                    {role === "freelancer" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location / Area</label>
                                <input value={formData.location} onChange={(e) => updateField("location", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rate per gig (INR)</label>
                                <input value={formData.ratePerGig} onChange={(e) => updateField("ratePerGig", e.target.value)} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        </div>
                    )}

                    {role === "maker" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product categories</label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {categoryOptions.map(option => (
                                    <button key={option} type="button" onClick={() => toggleCheckbox("productCategories", option)} className={`rounded-lg border px-3 py-2 text-sm ${formData.productCategories.includes(option) ? "border-[#2D6A4F] bg-[#E6F4EA] text-[#2D6A4F]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {role === "freelancer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Skills</label>
                            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {freelancerSkills.map(option => (
                                    <button key={option} type="button" onClick={() => toggleCheckbox("skills", option)} className={`rounded-lg border px-3 py-2 text-sm ${formData.skills.includes(option) ? "border-[#2D6A4F] bg-[#E6F4EA] text-[#2D6A4F]" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {(role === "maker" || role === "freelancer") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Short bio</label>
                            <textarea value={formData.bio} onChange={(e) => updateField("bio", e.target.value)} rows={3} maxLength={200} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            <p className="mt-1 text-xs text-gray-500">Maximum 200 characters.</p>
                        </div>
                    )}

                    {role === "freelancer" && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Portfolio website link (optional)</label>
                                <input value={formData.portfolioWebsite} onChange={(e) => updateField("portfolioWebsite", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Instagram handle (optional)</label>
                                <input value={formData.instagramHandle} onChange={(e) => updateField("instagramHandle", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                            </div>
                        </div>
                    )}

                    {(role === "shopkeeper" || role === "maker" || role === "freelancer") && (
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID proof type</label>
                                <select value={formData.idProofType} onChange={(e) => updateField("idProofType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]">
                                    <option value="">Select proof</option>
                                    {proofOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ID proof number</label>
                                <input value={formData.idProofNumber} onChange={(e) => updateField("idProofNumber", e.target.value)} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]" />
                                {role === "maker" && <p className="mt-1 text-xs text-gray-500">We only store this for verification. Never share your full Aadhaar publicly.</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="w-full sm:w-auto rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#24563f] disabled:cursor-not-allowed disabled:bg-gray-400">
                            {isSaving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
