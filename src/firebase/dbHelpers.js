import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export const createNotification = async ({ recipientId, actorId, type, message, entityType = null, entityId = null }) => {
    if (!recipientId || !type || !message) return;

    await addDoc(collection(db, "notifications"), {
        recipientId,
        actorId,
        type,
        message,
        entityType,
        entityId,
        read: false,
        createdAt: serverTimestamp()
    });
};

export const createConnectionRequest = async ({ makerId, makerName, makerPhotoUrl, shopId, shopName }) => {
    const request = {
        requestType: "connection",
        shopId,
        shopName,
        makerId,
        makerName,
        makerPhotoUrl,
        status: "Pending",
        createdAt: serverTimestamp()
    };

    const requestRef = await addDoc(collection(db, "connectionRequests"), request);
    return { id: requestRef.id, ...request };
};

export const acceptConnectionRequest = async (requestId, requestData) => {
    if (!requestData?.makerId || !requestData?.shopId) {
        throw new Error("Invalid connection request data.");
    }

    await updateDoc(doc(db, "connectionRequests", requestId), {
        status: "Connected",
        acceptedAt: serverTimestamp()
    });

    await setDoc(doc(db, "connections", `${requestData.makerId}_${requestData.shopId}`), {
        makerId: requestData.makerId,
        makerName: requestData.makerName,
        makerPhotoUrl: requestData.makerPhotoUrl || "",
        shopId: requestData.shopId,
        shopName: requestData.shopName,
        shopPhotoUrl: requestData.shopPhotoUrl || "",
        status: "Connected",
        connectedAt: serverTimestamp()
    });
};

export const rejectConnectionRequest = async (requestId) => {
    await updateDoc(doc(db, "connectionRequests", requestId), {
        status: "Rejected",
        rejectedAt: serverTimestamp()
    });
};

export const createInventoryForConsignment = async (consignment) => {
    await setDoc(doc(db, "inventory", consignment.id), {
        consignmentId: consignment.id,
        shopId: consignment.shopId,
        shopName: consignment.shopName,
        makerId: consignment.makerId,
        makerName: consignment.makerName,
        productId: consignment.productId,
        productName: consignment.productName,
        productImageUrl: consignment.productImageUrl || consignment.product?.imageUrl || consignment.product?.image || consignment.product?.photoUrl || consignment.product?.photo || "",
        quantityRemaining: Number(consignment.quantityRemaining || 0),
        quantitySold: Number(consignment.quantitySold || 0),
        totalQuantity: Number(consignment.quantityRemaining || 0) + Number(consignment.quantitySold || 0),
        makerPercent: Number(consignment.makerPercent ?? consignment.splitPercentage ?? 50),
        shopPercent: Number(consignment.shopPercent ?? 100 - (consignment.makerPercent ?? consignment.splitPercentage ?? 50)),
        status: "Active",
        acceptedAt: serverTimestamp(),
        createdAt: serverTimestamp()
    });
};

export const updateInventorySale = async ({ consignmentId, quantitySold, quantityRemaining }) => {
    await updateDoc(doc(db, "inventory", consignmentId), {
        quantitySold,
        quantityRemaining,
        status: quantityRemaining <= 0 ? "Settled" : "Active",
        updatedAt: serverTimestamp()
    });
};

export const recordSettlement = async ({ saleIds, shopId, shopName, makerId, makerName, amountOwed }) => {
    await addDoc(collection(db, "settlements"), {
        saleIds: saleIds || [],
        shopId,
        shopName,
        makerId,
        makerName,
        amountOwed: Number(amountOwed || 0),
        paidAt: serverTimestamp(),
        createdAt: serverTimestamp()
    });
};
