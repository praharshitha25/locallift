# QUICK REFERENCE - Production-Ready Architecture

## Image Fields Cheat Sheet

### When Creating New Data

**Products**
```javascript
{
  productName: "Resin Coaster",
  imageUrl: "https://res.cloudinary.com/...",  // ← Use imageUrl
  price: 500,
  // Old field names not needed
}
```

**User Profiles** (on signup/update)
```javascript
{
  name: "John Maker",
  email: "john@example.com",
  photoUrl: "https://ui-avatars.com/api/?name=...",  // ← Use photoUrl
  role: "maker",
  // Old field names not needed
}
```

### Displaying Images in Components

**For Products**
```javascript
import { getImageUrl } from "@/lib/imageHelpers";

const imageUrl = getImageUrl(product);
// Tries: product.imageUrl → product.image → product.photoUrl → ""
```

**For Profiles/Avatars**
```javascript
import { getProfilePhotoUrl } from "@/lib/imageHelpers";

const avatarUrl = getProfilePhotoUrl(user);
// Tries: user.photoUrl → user.photo → user.image → api_avatar
```

**Using SafeImage Component** (optional)
```javascript
import SafeImage from "@/components/SafeImage";

<SafeImage 
  src={imageUrl} 
  fallbackSrc="https://ui-avatars.com/api/?name=User" 
  alt="Profile"
/>
```

---

## Workflow Functions Cheat Sheet

### Create Connection Request
```javascript
import { createConnectionRequest } from "@/firebase/dbHelpers";

const request = await createConnectionRequest({
  makerId: "maker_uid",
  makerName: "John Maker",
  makerPhotoUrl: "https://...",
  shopId: "shop_uid",
  shopName: "Main Shop"
});
```

### Accept Connection Request
```javascript
import { acceptConnectionRequest } from "@/firebase/dbHelpers";

await acceptConnectionRequest(requestId, {
  makerId: "maker_uid",
  shopId: "shop_uid",
  status: "Connected"
});
```

### Record Sale & Settlement
```javascript
import { updateInventorySale, recordSettlement } from "@/firebase/dbHelpers";

// Update inventory
await updateInventorySale({
  consignmentId: "consignment_123",
  quantitySold: 5,
  quantityRemaining: 10
});

// Record settlement (when paying out)
await recordSettlement({
  saleIds: ["sale_1", "sale_2", "sale_3"],
  shopId: "shop_uid",
  shopName: "Main Shop",
  makerId: "maker_uid",
  makerName: "John",
  amountOwed: 5000
});
```

### Create Notification
```javascript
import { createNotification } from "@/firebase/dbHelpers";

await createNotification({
  recipientId: "shop_uid",
  actorId: "maker_uid",
  type: "connection_request_sent",
  message: "John wants to connect your shop",
  entityType: "connectionRequest",
  entityId: "request_123"
});
```

---

## Component Pattern Updates

### Before (Old Image Handling)
```javascript
<img src={product.image} alt={product.name} />
```

### After (New Image Handling)
```javascript
import { getImageUrl } from "@/lib/imageHelpers";

<img 
  src={getImageUrl(product)} 
  alt={product.name}
  onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=Product"}
/>
```

---

## Real-Time Sync Pattern

### In Components
```javascript
import { useContext, useEffect } from "react";
import { AuthContext } from "@/auth/AuthContext";

export default function MyComponent() {
  const { userDoc } = useContext(AuthContext);
  
  useEffect(() => {
    // userDoc updates in real-time when profile changes
    console.log("Profile photo:", userDoc?.photoUrl);
  }, [userDoc?.photoUrl]);
  
  return <div>Hi, {userDoc?.name}</div>;
}
```

---

## Collection Structure Reference

### connectionRequests
```javascript
{
  makerId: "uid",
  makerName: "Name",
  makerPhotoUrl: "url",
  shopId: "uid",
  shopName: "Name",
  status: "Pending" | "Connected" | "Rejected",
  createdAt: timestamp,
  respondedAt: timestamp (if responded)
}
```

### connections
```javascript
{
  makerId: "uid",
  makerName: "Name",
  shopId: "uid",
  shopName: "Name",
  status: "Active" | "Inactive",
  connectedAt: timestamp
}
```

### inventory
```javascript
{
  consignmentId: "ref",
  productId: "ref",
  productName: "Name",
  productImageUrl: "url",
  makerId: "uid",
  makerName: "Name",
  shopId: "uid",
  quantityRemaining: 10,
  quantitySold: 5,
  retailPrice: 500,
  status: "Active" | "Settled"
}
```

### settlements
```javascript
{
  shopId: "uid",
  shopName: "Name",
  makerId: "uid",
  makerName: "Name",
  amountOwed: 5000,
  saleIds: ["sale_1", "sale_2"],
  paidAt: timestamp (if paid),
  status: "Pending" | "Paid"
}
```

### notifications
```javascript
{
  recipientId: "uid",
  actorId: "uid",
  type: "connection_request_sent" | "sale_logged" | "...",
  message: "Human readable message",
  entityType: "connectionRequest" | "sale" | "...",
  entityId: "doc_id",
  read: false,
  createdAt: timestamp
}
```

---

## Query Patterns (with useCollection hook)

### Get All Pending Connection Requests (for Shopkeeper)
```javascript
const { data: requests } = useCollection("connectionRequests", [
  where("shopId", "==", uid),
  where("status", "==", "Pending"),
  orderBy("createdAt", "desc")
], true);
```

### Get Active Connections
```javascript
const { data: connections } = useCollection("connections", [
  where("shopId", "==", uid),
  where("status", "==", "Active")
], true);
```

### Get Maker's Active Inventory
```javascript
const { data: inventory } = useCollection("inventory", [
  where("shopId", "==", shopId),
  where("status", "==", "Active"),
  orderBy("quantityRemaining", "desc")
], true);
```

### Get Settlements Owed to Maker
```javascript
const { data: settlements } = useCollection("settlements", [
  where("makerId", "==", uid),
  where("status", "==", "Pending"),
  orderBy("amountOwed", "desc")
], true);
```

### Get User's Notifications
```javascript
const { data: notifications } = useCollection("notifications", [
  where("recipientId", "==", uid),
  where("read", "==", false),
  orderBy("createdAt", "desc")
], true);
```

---

## Error Handling Pattern

```javascript
import { createConnectionRequest } from "@/firebase/dbHelpers";

async function handleConnect() {
  try {
    const request = await createConnectionRequest({...});
    setSuccess("Connection request sent!");
    // Clear form, refetch data
  } catch (error) {
    console.error("Connection request failed:", error);
    setError(error.message || "Failed to send request");
  }
}
```

---

## Testing Checklist

- [ ] Real-time sync: Edit profile in Tab A, verify Tab B updates instantly
- [ ] Image fallback: Remove imageUrl, verify image field displays
- [ ] Connection request: Create via dbHelpers, verify appears in query
- [ ] Notification: Create notification, verify appears in notifications collection
- [ ] Security: Try to access other user's data via console, verify denied
- [ ] Avatar fallback: Delete photoUrl, verify avatar API generates
- [ ] SafeImage: Use on product with no image, verify fallback shows

---

## Firestore Rules Pattern

Every collection follows this pattern:

```javascript
// 1. Read: Anyone with UID can read (or specific UIDs if sensitive)
allow read: if request.auth != null;

// 2. Write: Only owner or participants can write
allow write: if request.auth.uid == resource.data.makerId || 
             request.auth.uid == resource.data.shopId;

// 3. Delete: Usually restricted or same as write
allow delete: if request.auth.uid == resource.data.makerId;
```

---

## Performance Tips

1. **Use indexed queries**: Let Firestore suggest indexes automatically
2. **Pagination**: For large lists, use `limit()` and `startAfter()`
3. **Denormalization**: Store copies of frequently accessed data
4. **Real-time only when needed**: Use one-time fetches for static data
5. **Batch operations**: Group related writes together

---

## Common Pitfalls

❌ **Don't**: Mix new and old image field names
```javascript
{ image: "...", imageUrl: "..." }  // Confusing
```

✅ **Do**: Use helpers to read both
```javascript
getImageUrl(item)  // Handles both automatically
```

---

❌ **Don't**: Create data without standardized fields
```javascript
{ name: "John", photo: "...", role: "maker" }  // No photoUrl
```

✅ **Do**: Use standardized fields
```javascript
{ name: "John", photoUrl: "...", role: "maker" }
```

---

❌ **Don't**: Manually aggregate settlements repeatedly
```javascript
const sales = await db.collection("sales")
  .where("makerId", "==", uid).get();
const total = sales.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
```

✅ **Do**: Query the aggregated collection
```javascript
const settlement = await db.collection("settlements")
  .where("makerId", "==", uid)
  .where("shopId", "==", shopId)
  .limit(1)
  .get();
```

---

**Last Updated**: 2024  
**Version**: 1.0
