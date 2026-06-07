import { useState, useEffect, useMemo } from "react";
import { uploadToCloudinary } from "../lib/cloudinary";

const categoryOptions = ["Food", "Craft", "Art", "Clothing", "Other"];
const shopCategories = ["Gift Store", "Fashion & Lifestyle", "Food & Groceries", "Handmade Store", "Natural Products", "Other"];
const freelancerSkills = ["Instagram Reels", "Product Photography", "Graphic Design", "Video Editing", "Social Media Management", "Content Writing", "Other"];
const idProofOptions = {
    maker: ["Aadhaar", "PAN", "Voter ID"],
    freelancer: ["Aadhaar", "Student ID", "PAN", "Voter ID"],
    shopkeeper: ["GST Number", "Shop License", "Udyam/MSME Number", "Other"]
};

const ProfileForm = ({ role, initialData, onSave, isSaving, message, onCancel }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        location: "",
        upiId: "",
        idProofType: "",
        idProofNumber: "",
        brandName: "",
        productCategories: [],
        bio: "",
        shopName: "",
        shopCategory: "",
        shopAddress: "",
        businessHours: "",
        googleMapsLink: "",
        skills: [],
        ratePerGig: "",
        portfolioWebsite: "",
        instagramHandle: "",
        photoURL: "",
        photoUrl: "",
        coverImageURL: "",
        coverImageUrl: "",
        coverImage: ""
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [coverPreview, setCoverPreview] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(message || "");

    useEffect(() => {
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
            photoUrl: initialData?.photoURL || initialData?.photoUrl || "",
            coverImageURL: initialData?.coverImageURL || initialData?.coverImageUrl || initialData?.coverImage || "",
            coverImageUrl: initialData?.coverImageURL || initialData?.coverImageUrl || initialData?.coverImage || "",
            coverImage: initialData?.coverImageURL || initialData?.coverImageUrl || initialData?.coverImage || ""
        });
        setPhotoFile(null);
        setCoverFile(null);
        setPhotoPreview(initialData?.photoURL || initialData?.photoUrl || "");
        setCoverPreview(initialData?.coverImageURL || initialData?.coverImageUrl || initialData?.coverImage || "");
        setError("");
        setSuccessMessage("");
    }, [initialData, role]);

    const proofOptions = useMemo(() => idProofOptions[role] || [], [role]);
    const roleTitle = useMemo(() => {
        if (role === "maker") return "Complete Your Maker Profile";
        if (role === "shopkeeper") return "Complete Your Shop Profile";
        return "Complete Your Freelancer Profile";
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

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");

        const phone = formData.phone.trim();
        const phoneRegex = /^[0-9]{10}$/;

        if (!formData.name.trim() || !phone) {
            setError("Name and phone are required.");
            return;
        }

        if (!phoneRegex.test(phone)) {
            setError("Phone must be a valid 10-digit number.");
            return;
        }

        try {
            let uploadedPhotoUrl = formData.photoURL || formData.photoUrl || "";
            let uploadedCoverUrl = formData.coverImageURL || formData.coverImageUrl || formData.coverImage || "";

            if (photoFile) {
                uploadedPhotoUrl = await uploadToCloudinary(photoFile);
            }

            if (coverFile) {
                uploadedCoverUrl = await uploadToCloudinary(coverFile);
            }

            const profileData = {
                name: formData.name.trim(),
                phone,
                location: formData.location.trim(),
                upiId: formData.upiId.trim(),
                idProofType: formData.idProofType,
                idProofNumber: formData.idProofNumber.trim(),
                photoURL: uploadedPhotoUrl,
                photoUrl: uploadedPhotoUrl,
                coverImageURL: uploadedCoverUrl,
                coverImageUrl: uploadedCoverUrl,
                coverImage: uploadedCoverUrl,
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
            setSuccessMessage("Profile saved! Redirecting to dashboard...");
        } catch (err) {
            setError(err.message || "Could not save profile.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F0] py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-[16px] border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{roleTitle}</h1>
                            {message && <p className="text-gray-600">{message}</p>}
                        </div>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {successMessage}
                        </div>
                    )}

                    {/* Cover Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cover Image</label>
                        <div className="overflow-hidden rounded-[18px] bg-gray-100">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
                            ) : (
                                <div className="flex h-40 items-center justify-center text-gray-400 text-lg">Upload a cover image to make your profile stand out</div>
                            )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            Upload Cover Image
                            <input type="file" accept="image/*" className="sr-only" onChange={handleCoverChange} />
                        </label>
                    </div>

                    {/* Photo Upload */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 flex-shrink-0">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-400 text-xl">?</div>
                                    )}
                                </div>
                                <label className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                    Upload Photo
                                    <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Your phone"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location and UPI */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {(role === "maker" || role === "freelancer") && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Area</label>
                                <input
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Your area"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                            <input
                                value={formData.upiId}
                                onChange={(e) => updateField("upiId", e.target.value)}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                placeholder="yourname@upi"
                            />
                        </div>
                    </div>

                    {/* Maker-specific fields */}
                    {role === "maker" && (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input
                                        value={formData.brandName}
                                        onChange={(e) => updateField("brandName", e.target.value)}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="Your brand"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                                    <select
                                        value={formData.idProofType}
                                        onChange={(e) => updateField("idProofType", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    >
                                        <option value="">Select proof</option>
                                        {proofOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number</label>
                                <input
                                    value={formData.idProofNumber}
                                    onChange={(e) => updateField("idProofNumber", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Your ID number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categoryOptions.map(category => (
                                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.productCategories.includes(category)}
                                                onChange={() => toggleCheckbox("productCategories", category)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{category}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => updateField("bio", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Tell us about your brand..."
                                />
                            </div>
                        </>
                    )}

                    {/* Shopkeeper-specific fields */}
                    {role === "shopkeeper" && (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                    <input
                                        value={formData.shopName}
                                        onChange={(e) => updateField("shopName", e.target.value)}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="Your shop name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Category</label>
                                    <select
                                        value={formData.shopCategory}
                                        onChange={(e) => updateField("shopCategory", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    >
                                        <option value="">Select category</option>
                                        {shopCategories.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Shop Address</label>
                                <textarea
                                    value={formData.shopAddress}
                                    onChange={(e) => updateField("shopAddress", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Complete address"
                                />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                                    <input
                                        value={formData.businessHours}
                                        onChange={(e) => updateField("businessHours", e.target.value)}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="e.g. 9 AM - 9 PM"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link (optional)</label>
                                    <input
                                        value={formData.googleMapsLink}
                                        onChange={(e) => updateField("googleMapsLink", e.target.value)}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="Google Maps link"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Freelancer-specific fields */}
                    {role === "freelancer" && (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate Per Project (INR)</label>
                                    <input
                                        value={formData.ratePerGig}
                                        onChange={(e) => updateField("ratePerGig", e.target.value)}
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="2000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / Area</label>
                                    <input
                                        value={formData.location}
                                        onChange={(e) => updateField("location", e.target.value)}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                        placeholder="Your area"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {freelancerSkills.map(skill => (
                                        <label key={skill} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.skills.includes(skill)}
                                                onChange={() => toggleCheckbox("skills", skill)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
                                <input
                                    value={formData.portfolioWebsite}
                                    onChange={(e) => updateField("portfolioWebsite", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Your website URL"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                                <input
                                    value={formData.instagramHandle}
                                    onChange={(e) => updateField("instagramHandle", e.target.value)}
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="@yourhandle"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => updateField("bio", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </>
                    )}

                    {/* Submit buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] disabled:bg-gray-400 transition font-medium"
                        >
                            {isSaving ? "Saving..." : "Save Profile"}
                        </button>
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;
