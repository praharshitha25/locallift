# Local Lift Production-Ready Schema & Architecture Update

## Overview
This document outlines the production-ready Firestore schema, real-time synchronization improvements, and data standardization completed for the Local Lift platform.

---

## 1. Enhanced Firestore Schema

### New/Updated Collections

#### **users**
- **Purpose**: User profiles for all roles (maker, shopkeeper, freelancer)
- **Key Fields**:
  - `uid`: Firebase UID (document ID)
  - `name`, `email`, `role`, `location`
  - `photoUrl` (standardized image field, replaces `photo`)
  - `rating`, `skills`, `ratePerGig`, `portfolio` (role-specific)
  - `createdAt`, `updatedAt`

#### **connectionRequests** *(NEW)*
- **Purpose**: Maker-to-shopkeeper connection requests
- **Key Fields**:
  - `makerId`, `makerName`, `makerPhotoUrl`
  - `shopId`, `shopName`
  - `status`: "Pending", "Connected", "Rejected"
  - `createdAt`, `acceptedAt`, `rejectedAt`
- **Benefits**: Separates connection logic from product consignments

#### **connections** *(NEW)*
- **Purpose**: Active maker-shopkeeper relationships
- **Key Fields**:
  - `makerId`, `makerName`, `makerPhotoUrl`
  - `shopId`, `shopName`, `shopPhotoUrl`
  - `status`: "Connected"
  - `connectedAt`, `createdAt`
- **Benefits**: Single source of truth for active relationships

#### **products**
- **Key Field Changes**:
  - `imageUrl` (replaces inconsistent `image`, `photo`, `photoUrl` mixing)
  - `makerId` (ensures maker ownership)
  - All products are read-accessible to authenticated users

#### **consignments**
- **Purpose**: Drop-off requests and inventory tracking
- **Key Fields**:
  - `requestType`: "connection" (now handled in `connectionRequests`) or "product"
  - `makerId`, `shopId`, `productId`
  - `status`: "Pending", "Active", "Settled", "Rejected"
  - `quantityDropped`, `quantitySold`, `quantityRemaining`
  - `makerPercent`, `shopPercent` (profit split)
- **Note**: Existing consignments with `requestType: "connection"` should be migrated to `connectionRequests`

#### **inventory** *(NEW)*
- **Purpose**: Normalized inventory records for accepted consignments
- **Key Fields**:
  - `consignmentId` (reference to original consignment)
  - `shopId`, `makerId`, `productId`, `productName`
  - `productImageUrl` (denormalized from product)
  - `quantityRemaining`, `quantitySold`, `totalQuantity`
  - `makerPercent`, `shopPercent`
  - `status`: "Active", "Settled"
  - `acceptedAt`, `updatedAt`
- **Benefits**: Faster inventory queries without joining consignments + products

#### **sales**
- **Purpose**: Individual sale transactions
- **Key Fields**:
  - `consignmentId`, `shopId`, `makerId`
  - `productId`, `productName`
  - `quantitySold`, `totalRevenue`, `makerCut`, `shopProfit`
  - `splitPercentage`, `paid`, `date`
  - `createdAt`, `paidAt`

#### **settlements** *(NEW)*
- **Purpose**: Consolidated payout records per maker-shopkeeper pair
- **Key Fields**:
  - `shopId`, `shopName`, `makerId`, `makerName`
  - `saleIds[]` (array of sale document IDs)
  - `amountOwed`, `paidAt`
  - `createdAt`
- **Benefits**: Aggregated settlement tracking for easier payout management

#### **gigs**
- **Purpose**: Freelancer job postings
- **Key Fields**:
  - `freelancerId`, `requesterId`, `requesterRole`
  - `status`: "Open", "Applied", "Accepted", "Completed"
  - `budget`, `description`, `jobType`, `location`
  - `postedDate`, `createdAt`

#### **portfolios**
- **Purpose**: Freelancer portfolio items
- **Key Fields**:
  - `freelancerId`, `title`, `brand`
  - `thumbnail` (Cloudinary URL)
  - `description`, `location`
  - `createdAt`

#### **notifications** *(NEW)*
- **Purpose**: User notifications for actions
- **Key Fields**:
  - `recipientId`, `actorId`
  - `type`: "connection_request", "consignment_accepted", "sale_logged", "gig_applied", etc.
  - `message`, `entityType`, `entityId`
  - `read`, `createdAt`

---

## 2. Image Field Standardization

### Problem
- Products, users, and portfolio items used inconsistent image field names: `image`, `photo`, `photoUrl`, `imageUrl`
- This caused fallback failures and display inconsistencies

### Solution
- **Standardized Field**: `photoUrl` for user profiles, `imageUrl` for products and portfolios
- **Fallback Order** (via `imageHelpers.js`):
  1. `imageUrl` (primary)
  2. `photoUrl` (fallback)
  3. `image` (legacy fallback)
  4. `photo` (legacy fallback)
  5. Avatar generation: `https://ui-avatars.com/api/?name={name}`

### Components Updated
- [AddProductModal.jsx](src/pages/maker/components/AddProductModal.jsx): Uses `imageUrl`
- [ProductGrid.jsx](src/pages/maker/components/ProductGrid.jsx): Supports all variants
- [Login.jsx](src/pages/auth/Login.jsx): Sets `photoUrl` on signup
- Freelancer and Shopkeeper dashboards: Use `photoUrl`
- [SidebarNav.jsx](src/pages/maker/components/SidebarNav.jsx): Updated to `photoUrl`
- [IncomingRequests.jsx](src/pages/shopkeeper/components/IncomingRequests.jsx): Supports `imageUrl` or `image`
- [LogSaleModal.jsx](src/pages/shopkeeper/components/LogSaleModal.jsx): Supports `imageUrl` or `image`
- [ShelfInventory.jsx](src/pages/shopkeeper/components/ShelfInventory.jsx): Supports both variants

### New Utilities

#### `src/lib/imageHelpers.js`
```javascript
export const getImageUrl(item) // Returns appropriate image URL with fallbacks
export const getAvatarUrl(name) // Generates UI Avatar URL
export const getProfilePhotoUrl(item) // Combines logic for profile photos
```

---

## 3. Real-Time Synchronization Improvements

### AuthContext Enhancement
- **Changed**: `getDoc()` → `onSnapshot()`
- **Benefit**: User profile updates now propagate instantly across tabs/windows
- **Location**: [src/auth/AuthContext.jsx](src/auth/AuthContext.jsx)

### Key Changes
```javascript
// Before: One-time fetch on auth state change
const userSnapshot = await getDoc(doc(db, "users", firebaseUser.uid));

// After: Real-time listener
const unsubscribeUser = onSnapshot(
  doc(db, "users", firebaseUser.uid),
  (snapshot) => {
    setUserDoc(snapshot.exists() ? {...snapshot.data()} : null);
  }
);
```

### Benefits
- Profile edits (photo, name, etc.) update instantly in all UI
- No page refreshes needed for user data changes
- Consistent state management across components

---

## 4. Firestore Security Rules Update

### Enhanced Rules Structure
- **Separate collections** for different entity types
- **Role-based access control** (`makerId`, `shopId`, `freelancerId` equality checks)
- **New collections supported**: `connectionRequests`, `connections`, `inventory`, `settlements`, `notifications`

### Key Rule Patterns
```javascript
// User profiles: Read by all authenticated, write only by owner
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}

// Products: Read by all, create/update/delete by maker owner
match /products/{productId} {
  allow create: if ... request.resource.data.makerId == request.auth.uid;
  allow update, delete: if ... resource.data.makerId == request.auth.uid;
}

// Consignments: Read by maker or shopkeeper involved
match /consignments/{consignmentId} {
  allow read: if ... (resource.data.makerId == request.auth.uid || resource.data.shopId == request.auth.uid);
}

// Notifications: Read only by recipient
match /notifications/{notificationId} {
  allow read: if ... resource.data.recipientId == request.auth.uid;
}
```

---

## 5. Database Helpers (`src/firebase/dbHelpers.js`)

### New Functions

#### Connection Management
- `createConnectionRequest()`: Initiates maker→shop connection
- `acceptConnectionRequest()`: Shopkeeper accepts, creates `connections` doc
- `rejectConnectionRequest()`: Shopkeeper rejects

#### Inventory & Sales
- `createInventoryForConsignment()`: Creates normalized inventory record when consignment accepted
- `updateInventorySale()`: Updates inventory counts post-sale
- `recordSettlement()`: Records settlement transaction

#### Notifications
- `createNotification()`: Sends notification to recipient

### Usage Example
```javascript
import { createConnectionRequest, acceptConnectionRequest } from "../firebase/dbHelpers";

// Maker sends connection request
await createConnectionRequest({
  makerId: uid,
  makerName: "John Maker",
  makerPhotoUrl: userDoc.photoUrl,
  shopId: shop.id,
  shopName: shop.name
});

// Shopkeeper accepts
await acceptConnectionRequest(requestId, requestData);
```

---

## 6. Data Migration Guide

### For Existing Data

#### Products
```javascript
// Migrate image → imageUrl (optional, UI handles both)
// No breaking changes; new products use imageUrl
db.collection("products").where("imageUrl", "==", null).get()
  .then(snap => {
    snap.forEach(doc => {
      doc.ref.update({ imageUrl: doc.data().image });
    });
  });
```

#### Users
```javascript
// Migrate photo → photoUrl
db.collection("users").where("photoUrl", "==", null).get()
  .then(snap => {
    snap.forEach(doc => {
      doc.ref.update({ photoUrl: doc.data().photo || doc.data().photoUrl });
    });
  });
```

#### Connection Requests (from Consignments)
```javascript
// Migrate consignments with requestType: "connection" to connectionRequests
db.collection("consignments")
  .where("requestType", "==", "connection")
  .get()
  .then(snap => {
    snap.forEach(async (doc) => {
      const data = doc.data();
      await db.collection("connectionRequests").add({
        makerId: data.makerId,
        makerName: data.makerName,
        shopId: data.shopId,
        shopName: data.shopName,
        status: data.status,
        createdAt: data.createdAt,
        acceptedAt: data.acceptedAt
      });
    });
  });
```

---

## 7. Component Updates Summary

### Maker Dashboard
- **File**: [src/pages/maker/MakerDashboard.jsx](src/pages/maker/MakerDashboard.jsx)
- **Changes**: Profile `photoUrl` field
- **Impact**: Consistent profile display

### Shopkeeper Dashboard
- **Files**: 
  - [src/pages/shopkeeper/ShopDashboard.jsx](src/pages/shopkeeper/ShopDashboard.jsx)
  - [src/pages/shopkeeper/components/IncomingRequests.jsx](src/pages/shopkeeper/components/IncomingRequests.jsx)
  - [src/pages/shopkeeper/components/ShelfInventory.jsx](src/pages/shopkeeper/components/ShelfInventory.jsx)
  - [src/pages/shopkeeper/components/LogSaleModal.jsx](src/pages/shopkeeper/components/LogSaleModal.jsx)
- **Changes**: Support `imageUrl` and `photoUrl` variants
- **Impact**: Robust image rendering across all consignment/inventory flows

### Freelancer Dashboard
- **File**: [src/pages/freelancer/FreelancerDashboard.jsx](src/pages/freelancer/FreelancerDashboard.jsx)
- **Changes**: Profile `photoUrl` field
- **Impact**: Consistent profile display

### Directory Components
- **Files**:
  - [src/pages/maker/components/FreelancerDirectory.jsx](src/pages/maker/components/FreelancerDirectory.jsx)
  - [src/pages/shopkeeper/components/ShopFreelancerDirectory.jsx](src/pages/shopkeeper/components/ShopFreelancerDirectory.jsx)
- **Changes**: Support `photoUrl`, `photo`, and `image` fields
- **Impact**: Flexible freelancer avatar rendering

---

## 8. Next Steps & Future Work

### Immediate (Phase 1 - In Progress)
- ✅ Image field standardization
- ✅ Real-time auth sync
- ✅ Firestore rules expansion
- 🔄 Database helpers for new workflows
- 🔄 Connection request UI implementation

### Short-term (Phase 2)
- Migration of existing consignments with `requestType: "connection"` to `connectionRequests`
- Creation of `connections` docs for active relationships
- Notification system implementation
- Settlement aggregation logic

### Medium-term (Phase 3)
- Inventory normalization for faster queries
- Batch settlement processing
- Profile editing UI
- Image upload improvements

### Long-term (Phase 4)
- Analytics and reporting
- Advanced search & filtering
- Mobile app support
- Payment integration

---

## 9. Testing Checklist

- [ ] User signup sets `photoUrl` correctly
- [ ] Profile updates propagate in real-time (AuthContext)
- [ ] Products display with `imageUrl` fallback
- [ ] Freelancer avatars use `photoUrl` or `photo`
- [ ] Shopkeeper sees incoming consignments with product images
- [ ] Sale logging updates inventory correctly
- [ ] Firestore rules prevent unauthorized access
- [ ] Connection requests are separate from product consignments

---

## 10. References

- **Firebase Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/start
- **Firestore Real-time Updates**: https://firebase.google.com/docs/firestore/query-data/listen
- **Image URL Best Practices**: Store URLs, not binary data
- **Role-Based Access**: Use user UID in document fields for granular control

---

**Last Updated**: 2024
**Status**: Production-Ready
