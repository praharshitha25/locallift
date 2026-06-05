# Workflow & Architecture Improvements

## Overview
This document summarizes the key workflow improvements and architectural decisions made for production readiness.

---

## 1. Maker → Shopkeeper Connection Workflow

### Before (Mixed Consignments)
```
Maker sends request
    ↓
Stores in consignments with requestType: "connection"
    ↓
Shopkeeper sees mixed pending requests (connections + products)
    ↓
If accepted, status = "Connected" (still in consignments)
    ↓
No clear representation of active relationships
```

### After (Separate Collections)
```
Maker sends request
    ↓
Creates doc in connectionRequests
    ↓
Shopkeeper sees connection request separately
    ↓
If accepted:
  - Status → "Connected" in connectionRequests
  - Creates doc in connections (active relationship)
  - Maker can now drop-off products
    ↓
Clear two-phase relationship: request → active
```

### Benefits
- **Clarity**: Connection requests are not mixed with product drop-offs
- **Queryability**: Easy to find "all pending connection requests" or "all active connections"
- **Auditability**: Full history maintained in `connectionRequests`

---

## 2. Product Drop-off & Inventory Workflow

### Current Flow
```
Maker drops off product
    ↓
Creates consignment doc with:
  - quantityDropped (initial quantity)
  - quantitySold = 0
  - quantityRemaining = quantityDropped
  - status = "Pending"
    ↓
Shopkeeper accepts
    ↓
status → "Active"
    ↓
Shopkeeper logs sales
    ↓
Updates consignment:
  - quantitySold += 1
  - quantityRemaining -= 1
  - If quantityRemaining <= 0, status = "Settled"
```

### Improved Flow (with Inventory Collection)
```
Maker drops off product
    ↓
Creates consignment doc (status = "Pending")
    ↓
Shopkeeper accepts
    ↓
status → "Active" in consignments
    ↓
Create normalized inventory doc:
  - copies productImageUrl
  - quantityRemaining, quantitySold
  - faster queries without joins
    ↓
Shopkeeper logs sales
    ↓
Updates both:
  - consignment (for history)
  - inventory (for fast queries)
    ↓
Sale recorded in sales collection
    ↓
Settlement aggregated in settlements
```

### Benefits
- **Performance**: Inventory queries don't need to join `consignments + products`
- **Normalization**: Consistent data structure for inventory
- **Analytics**: Easier to track inventory movement and sales trends

---

## 3. Sales & Settlement Tracking

### Current Logic
```
Sale logged
    ↓
Creates sales doc with:
  - consignmentId, shopId, makerId, productId
  - quantitySold, totalRevenue, makerCut, shopProfit
  - paid = false
    ↓
Shopkeeper views settlements
    ↓
Aggregates all sales by maker
    ↓
Calculates total amount owed
    ↓
Shopkeeper marks paid
    ↓
Updates sales.paid = true
```

### Improved Logic (with Settlements)
```
Sale logged
    ↓
Creates sales doc (paid = false)
    ↓
Also updates/creates settlement doc:
  - aggregates by shopId + makerId
  - saleIds: [array of sale IDs]
  - amountOwed (sum)
  - paidAt (when settlement marked paid)
    ↓
Shopkeeper marks settlement as paid
    ↓
Updates all sales in saleIds to paid = true
    ↓
Easier payout reconciliation
```

### Benefits
- **Aggregation**: Don't recalculate totals every time
- **Reconciliation**: One settlement doc = one payout transaction
- **Audit Trail**: Clear record of which sales were paid together

---

## 4. Real-time Profile Sync

### Before (Polling)
```
User logs in
    ↓
AuthContext fetches user doc via getDoc()
    ↓
Profile displayed
    ↓
User edits profile (photo, name)
    ↓
Profile updated in Firestore
    ↓
No automatic UI update
    ↓
User must refresh page
```

### After (Real-time Listener)
```
User logs in
    ↓
AuthContext sets up onSnapshot listener
    ↓
Profile displayed
    ↓
User edits profile in another tab
    ↓
Profile updated in Firestore
    ↓
Listener fires immediately
    ↓
All tabs with AuthContext update instantly
    ↓
No refresh needed
```

### Benefits
- **Seamless UX**: Changes propagate instantly
- **Multi-tab Support**: Edit in one tab, see updates in all tabs
- **Real-time Collaboration**: If shared editing is added later, foundation is ready

---

## 5. Image Field Standardization

### Problem Matrix
```
Component              Product.image   User.photo   Portfolio.thumb
───────────────────────────────────────────────────────────────────
ProductGrid            image ✓         -            -
AddProductModal         imageUrl       -            -
SidebarNav             -               photo        -
FreelancerDirectory    -               image/photo  -
ShopFreelancerDir      -               image/photo  -
IncomingRequests       image           -            -
LogSaleModal           image           -            -
ShelfInventory         image           -            -
```

### Solution: Fallback Chain
```javascript
// For products
imageUrl || image || photoUrl || (generated placeholder)

// For users/profiles
photoUrl || photo || image || (avatar API)

// For portfolios
thumbnail || (generated placeholder)
```

### Implementation
```javascript
// New helper in src/lib/imageHelpers.js
export const getImageUrl = (item) => {
  return item.imageUrl || item.photoUrl || item.image || item.photo || "";
};

// Usage in components
<img src={getImageUrl(product)} onError={fallback} />
```

### Benefits
- **Backward Compatible**: Old data still works
- **Forward Compatible**: New code uses standardized field
- **Graceful Degradation**: Avatar API generates placeholder if no image

---

## 6. Notification System (Skeleton)

### New Collection: notifications
```javascript
{
  recipientId: "uid_of_recipient",
  actorId: "uid_of_action_performer",
  type: "connection_request_sent",
  message: "John wants to connect your shop",
  entityType: "connectionRequest",
  entityId: "docId",
  read: false,
  createdAt: timestamp
}
```

### Event Types to Track
- `connection_request_sent`: Maker sends connection request
- `connection_accepted`: Shopkeeper accepts connection
- `consignment_request_sent`: Maker drops off product
- `consignment_accepted`: Shopkeeper accepts product
- `sale_logged`: Shopkeeper logs sale
- `settlement_paid`: Settlement marked paid
- `gig_posted`: Freelancer sees new gig
- `gig_accepted`: Gig request accepted

### Benefits
- **Engagement**: Users notified of actions
- **Transparency**: Clear audit trail
- **Scalability**: Ready for notification center or email/SMS integration

---

## 7. Security Model

### UID-Based Access Control
Every collection uses Firebase UID strings as primary access control:

```javascript
// Products: Only maker can edit
match /products/{productId} {
  allow write: if request.resource.data.makerId == request.auth.uid;
}

// Consignments: Only maker or shopkeeper can edit
match /consignments/{consignmentId} {
  allow update: if (resource.data.makerId == request.auth.uid || 
                     resource.data.shopId == request.auth.uid);
}

// Notifications: Only recipient can read
match /notifications/{notificationId} {
  allow read: if resource.data.recipientId == request.auth.uid;
}
```

### Benefits
- **Granular**: Fine-grained role-based access
- **Efficient**: No need for separate role collection
- **Auditability**: `request.auth.uid` clearly identifies user

---

## 8. Data Consistency Patterns

### Pattern: Store Denormalized Copies
Instead of joins, store related data in document:

```javascript
// In consignments:
{
  productId: "prod_123",
  productName: "Resin Coaster",  // Denormalized
  productImageUrl: "https://...",  // Denormalized
  makerId: "user_abc",
  makerName: "John",  // Denormalized
  shopId: "shop_xyz"
}

// Benefit: Single query returns all needed data
```

### Pattern: Aggregate Key
For fast lookups, aggregate important data:

```javascript
// In settlements:
{
  shopId: "shop_xyz",
  makerId: "user_abc",
  amountOwed: 5000,  // Aggregated (don't recalculate)
  saleIds: ["sale_1", "sale_2", "sale_3"]  // Reference array
}

// Benefit: O(1) lookup instead of sum query
```

### Pattern: Status Machines
Use clear status values and transitions:

```javascript
// Consignment status flow
"Pending" → "Active" → "Settled"
           → "Rejected"

// Sales status
created with paid: false
marked as paid: true

// ConnectionRequest status
"Pending" → "Connected"
          → "Rejected"
```

### Benefits
- **Predictable**: Developers know valid states
- **Queryable**: `where("status", "==", "Active")`
- **Auditable**: Status history is clear

---

## 9. API Design for New Workflows

### Connection Management
```javascript
// src/firebase/dbHelpers.js

async function createConnectionRequest({
  makerId, makerName, makerPhotoUrl,
  shopId, shopName
}) {
  // Validate
  // Create doc in connectionRequests
  // Create notification for shopkeeper
  // Return { id, ...data }
}

async function acceptConnectionRequest(requestId, requestData) {
  // Update status in connectionRequests
  // Create doc in connections
  // Create notification for maker
}

async function rejectConnectionRequest(requestId) {
  // Update status in connectionRequests
  // Create notification for maker
}
```

### Inventory Management
```javascript
async function createInventoryForConsignment(consignment) {
  // Create normalized inventory doc
  // Copy productImageUrl from product
  // Set status: "Active"
}

async function updateInventorySale({ consignmentId, quantitySold, quantityRemaining }) {
  // Update inventory counts
  // Update status if needed
}
```

### Benefits
- **Abstraction**: Logic centralized in helpers
- **Consistency**: Same code path for all workflows
- **Testing**: Helpers can be unit tested

---

## 10. Scalability Considerations

### Query Optimization
```javascript
// ❌ Inefficient (requires client-side filtering)
const allConsignments = await useCollection("consignments", [], true);
const pending = allConsignments.filter(c => c.status === "Pending");

// ✅ Efficient (server-side filtering)
const pendingConsignments = await useCollection("consignments", [
  where("status", "==", "Pending"),
  where("shopId", "==", uid)
], true);
```

### Pagination Pattern
```javascript
// For large lists, use pagination
const pageSize = 20;
const firstPage = await db.collection("sales")
  .where("shopId", "==", uid)
  .orderBy("createdAt", "desc")
  .limit(pageSize)
  .get();

const nextPage = await db.collection("sales")
  .where("shopId", "==", uid)
  .orderBy("createdAt", "desc")
  .startAfter(firstPage.docs[firstPage.docs.length - 1])
  .limit(pageSize)
  .get();
```

### Index Requirements
```
// Firestore will suggest these automatically when you try complex queries:
- users: (role, createdAt)
- consignments: (shopId, status)
- consignments: (makerId, status)
- sales: (shopId, createdAt desc)
- sales: (makerId, createdAt desc)
- inventory: (shopId, status)
```

### Benefits
- **Performance**: Queries scale with data growth
- **Cost**: Fewer documents read per request
- **UX**: Faster response times

---

## 11. Deployment Checklist

- [ ] Update Firestore rules (new collections)
- [ ] Deploy auth changes (photoUrl default)
- [ ] Deploy dbHelpers.js (new functions)
- [ ] Deploy component updates (image field support)
- [ ] Test real-time sync (multi-tab)
- [ ] Verify image fallbacks
- [ ] Test connection workflow
- [ ] Test product drop-off workflow
- [ ] Test sales & settlement workflow
- [ ] Run security audit
- [ ] Load testing on queries

---

## 12. Monitoring & Observability

### Key Metrics to Track
- Connection request acceptance rate
- Average time from drop-off to first sale
- Settlement payout success rate
- Image loading failures
- Firestore query latency by collection
- Authentication failure rate

### Logging Points
```javascript
// Connection workflow
console.log("connection_request_created", { makerId, shopId });
console.log("connection_accepted", { connectionId });

// Sales & settlement
console.log("sale_logged", { shopId, makerId, amount });
console.log("settlement_paid", { shopId, makerId, amount });

// Real-time sync
console.log("userDoc_updated_via_listener", { userId, fields });
```

### Error Handling
```javascript
// All dbHelpers should have try-catch and error logging
try {
  await createConnectionRequest({...});
} catch (err) {
  console.error("connection_request_failed", { 
    error: err.message, 
    makerId, 
    shopId 
  });
  throw err;  // Re-throw for UI handling
}
```

---

**Last Updated**: 2024
**Status**: Production-Ready Architecture
