export const getImageUrl = (item) => {
    if (!item) return "";
    return item.imageUrl || item.photoUrl || item.image || item.photo || "";
};

export const getAvatarUrl = (name) => {
    const label = encodeURIComponent(name || "User");
    return `https://ui-avatars.com/api/?name=${label}&background=2D6A4F&color=fff`;
};

export const getProfilePhotoUrl = (item) => getImageUrl(item) || getAvatarUrl(item?.name || item?.email || "User");
