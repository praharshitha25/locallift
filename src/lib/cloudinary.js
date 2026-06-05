const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dr7opwuae";
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "locallift";

export const uploadToCloudinary = async (file) => {
    if (!file) return "";

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error?.message || "Could not upload image to Cloudinary.");
    }

    return data.secure_url;
};
