export const sameId = (left, right) => String(left) === String(right);

export const findById = (items, id) => items.find(item => sameId(item.id, id));

export const enrichConsignment = (consignment, { products, makers, shops }) => {
    const product = findById(products, consignment.productId);
    const maker = findById(makers, consignment.makerId || product?.makerId) || {
        id: consignment.makerId || product?.makerId,
        name: consignment.makerName || product?.makerName || "Unknown Maker"
    };
    const shop = findById(shops, consignment.shopId) || {
        id: consignment.shopId,
        name: consignment.shopName || "Your Shop",
        distance: 0
    };
    const split = Number(consignment.splitPercentage ?? 50);

    return {
        ...consignment,
        product,
        maker,
        shop,
        split,
        makerPercent: split,
        shopPercent: 100 - split,
        quantityDropped: Number(consignment.quantityDropped || 0),
        quantitySold: Number(consignment.quantitySold || 0),
        quantityRemaining: Number(consignment.quantityRemaining ?? consignment.quantityDropped ?? 0)
    };
};

export const getInventoryStatus = (remaining) => {
    if (remaining <= 0) {
        return {
            label: "Out of Stock",
            className: "bg-red-100 text-red-700",
            textClassName: "text-red-600"
        };
    }

    if (remaining < 5) {
        return {
            label: "Low Stock",
            className: "bg-orange-100 text-orange-700",
            textClassName: "text-orange-600"
        };
    }

    return {
        label: "Active",
        className: "bg-green-100 text-green-700",
        textClassName: "text-gray-700"
    };
};
