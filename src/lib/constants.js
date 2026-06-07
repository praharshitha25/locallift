// Field standardization constants
export const SALES_FIELDS = {
    // Standard field names to use consistently
    QUANTITY_SOLD: "quantitySold",
    UNITS_SOLD: "quantitySold", // Alias - both map to same field
    TOTAL_REVENUE: "totalRevenue",
    MAKER_CUT: "makerCut", // Amount (not percentage)
    SHOP_PROFIT: "shopProfit",
    RETAIL_PRICE: "retailPrice",
    MAKER_PERCENT: "makerPercent",
    SPLIT_PERCENTAGE: "makerPercent", // Alias - both map to same field
    SHOP_PERCENT: "shopPercent",
    PAID: "paid"
};

export const SETTLEMENT_FIELDS = {
    SALE_IDS: "saleIds",
    SHOP_ID: "shopId",
    MAKER_ID: "makerId",
    AMOUNT_OWED: "amountOwed",
    PAID_AT: "paidAt"
};

export const PRODUCT_FIELDS = {
    IMAGE_URL: "imageUrl",
    IMAGE: "image", // Alias
    PHOTO_URL: "photoUrl", // Alias
    PHOTO: "photo", // Alias
    NAME: "name",
    CATEGORY: "category",
    WHOLESALE_PRICE: "wholesalePrice",
    RETAIL_PRICE: "retailPrice",
    QUANTITY: "quantity",
    DESCRIPTION: "description",
    MAKER_ID: "makerId",
    STATUS: "status"
};

export const PROFILE_FIELDS = {
    PHOTO_URL: "photoUrl",
    PHOTO_U_R_L: "photoURL", // Deprecated variant
    COVER_IMAGE_URL: "coverImageUrl",
    COVER_IMAGE_U_R_L: "coverImageURL", // Deprecated variant
    COVER_IMAGE: "coverImage" // Deprecated variant
};

// Utility to get image URL with fallbacks
export const getImageUrl = (obj, fieldNames = ["imageUrl", "image", "photoUrl"]) => {
    for (const field of fieldNames) {
        if (obj?.[field]) return obj[field];
    }
    return null;
};

// Utility to get profile photo with fallbacks
export const getProfilePhotoUrl = (obj) => {
    return obj?.photoUrl || obj?.photoURL || null;
};

// Utility to get cover image with fallbacks
export const getCoverImageUrl = (obj) => {
    return obj?.coverImageUrl || obj?.coverImageURL || obj?.coverImage || null;
};

// Calculate financial split consistently
export const calculateSplit = (totalRevenue, makerPercent) => {
    const makerCut = Math.round(totalRevenue * (makerPercent / 100));
    const shopProfit = totalRevenue - makerCut;
    return { makerCut, shopProfit };
};

// Validate sales data
export const validateSalesData = (sale) => {
    const errors = [];

    if (typeof sale.quantitySold !== "number" || sale.quantitySold < 0) {
        errors.push("Quantity sold must be a non-negative number");
    }

    if (typeof sale.totalRevenue !== "number" || sale.totalRevenue < 0) {
        errors.push("Total revenue must be a non-negative number");
    }

    if (typeof sale.retailPrice !== "number" || sale.retailPrice <= 0) {
        errors.push("Retail price must be a positive number");
    }

    if (typeof sale.makerPercent !== "number" || sale.makerPercent < 0 || sale.makerPercent > 100) {
        errors.push("Maker percent must be between 0 and 100");
    }

    return errors;
};
