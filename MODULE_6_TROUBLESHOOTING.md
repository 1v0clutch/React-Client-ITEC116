# Module 6 E-Commerce - Troubleshooting Guide

## Issue: White Screen on Order Management Page

### Possible Causes & Solutions

#### 1. No Orders Yet (Most Common)
**Symptom:** Page shows "No orders found" or white screen

**Solution:** This is normal if you haven't placed any orders yet!
1. Go to Product Catalog (`/ecommerce/catalog`)
2. Add items to cart
3. Complete checkout
4. Then check Order Management again

---

#### 2. Backend Not Running
**Symptom:** White screen, console shows network errors

**Check:**
```bash
# Make sure backend is running on port 8000
cd React-Client-ITEC116/backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 8000
```

---

#### 3. API Connection Issue
**Symptom:** Console shows "Failed to fetch" or CORS errors

**Solution:**
1. Verify backend is running on port 8000
2. Check browser console (F12) for specific errors
3. Try accessing API directly: http://localhost:8000/api/ecommerce/orders/all

---

#### 4. MongoDB Not Connected
**Symptom:** Backend console shows MongoDB connection errors

**Solution:**
1. Check `.env` file in backend folder
2. Verify MongoDB connection string is correct
3. Ensure MongoDB service is running

---

## Quick Diagnostic Steps

### Step 1: Check Browser Console
1. Open the Order Management page
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for any red error messages

### Step 2: Check Network Tab
1. In Developer Tools, go to Network tab
2. Refresh the page
3. Look for the request to `/api/ecommerce/orders/all`
4. Check if it returns 200 OK or an error

### Step 3: Test API Directly
Open in browser: http://localhost:8000/api/ecommerce/orders/all

**Expected Response (no orders):**
```json
[]
```

**Expected Response (with orders):**
```json
[
  {
    "_id": "...",
    "orderNumber": "ORD-...",
    "customerId": {...},
    "items": [...],
    "totalAmount": 100,
    ...
  }
]
```

---

## Common Error Messages

### Error: "Failed to load orders: HTTP error! status: 404"
**Cause:** API endpoint not found

**Solution:**
1. Verify backend server is running
2. Check that ecommerce routes are registered in `server.js`
3. Restart backend server

### Error: "Failed to load orders: NetworkError"
**Cause:** Backend not accessible

**Solution:**
1. Check backend is running on port 8000
2. Check firewall settings
3. Try accessing http://localhost:8000 directly

### Error: "Failed to load orders: SyntaxError"
**Cause:** API returning non-JSON response

**Solution:**
1. Check backend console for errors
2. Verify MongoDB is connected
3. Check API endpoint returns valid JSON

---

## Testing Order Management

### Create a Test Order

1. **Go to Inventory** (`/inventory/inventory-management`)
   - Ensure you have at least one item with stock

2. **Go to Product Catalog** (`/ecommerce/catalog`)
   - You should see your inventory items
   - Click "Add to Cart" on an item

3. **Go to Shopping Cart** (`/ecommerce/cart`)
   - Verify item is in cart
   - Click "Proceed to Checkout"

4. **Complete Checkout** (`/ecommerce/checkout`)
   - Create a new customer or select existing
   - Click "Place Order"
   - Wait for success toast

5. **Go to Order Management** (`/ecommerce/orders`)
   - You should now see your order!

---

## Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] At least one inventory item exists
- [ ] At least one order has been placed
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

---

## Files to Check

### Backend
```
backend/
├── server.js                          ← Routes registered?
├── controllers/ecommerce.controller.js ← getAllOrders function exists?
├── routes/ecommerce.routes.js         ← Route defined?
└── .env                               ← MongoDB connection string?
```

### Frontend
```
frontend/src/
├── pages/ECommerce/OrderManagement.jsx ← Component working?
└── App.jsx                            ← Route defined?
```

---

## Still Having Issues?

### Check Backend Logs
Look at the terminal where backend is running for any error messages.

### Check Frontend Console
Press F12 and look for:
- Red error messages
- Failed network requests
- JavaScript errors

### Verify API Endpoint
Test in browser or Postman:
```
GET http://localhost:8000/api/ecommerce/orders/all
```

Should return JSON array (empty or with orders).

---

## Module Isolation Verification

### Files Modified for Module 6 ONLY:

**Backend:**
- ✅ `models/Customer.js` (NEW)
- ✅ `models/OnlineOrder.js` (NEW)
- ✅ `controllers/ecommerce.controller.js` (NEW)
- ✅ `routes/ecommerce.routes.js` (NEW)
- ✅ `server.js` (added 2 lines for ecommerce routes)

**Frontend:**
- ✅ `components/Toast.jsx` (NEW)
- ✅ `pages/ECommerce/*` (ALL NEW)
- ✅ `App.jsx` (added ecommerce routes)
- ✅ `components/layouts/Sidebar.jsx` (added ecommerce nav)
- ✅ `index.css` (added toast animation)

**Other Modules:** ❌ NOT TOUCHED

All other modules (Inventory, Sales, HR, Finance, etc.) remain unchanged!

---

## Expected Behavior

### When No Orders Exist:
```
┌─────────────────────────────────────┐
│ Order Management                    │
├─────────────────────────────────────┤
│                                     │
│      No orders found                │
│                                     │
└─────────────────────────────────────┘
```

### When Orders Exist:
```
┌──────────────────────────────────────────────────────────┐
│ Order Management                                          │
├──────────────────────────────────────────────────────────┤
│ Order Number | Customer | Items | Total | Status | ...   │
├──────────────────────────────────────────────────────────┤
│ ORD-123...   | John Doe | 2     | $100  | Pending| ...   │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Fix Commands

### Restart Backend
```bash
cd React-Client-ITEC116/backend
# Stop with Ctrl+C if running
npm run dev
```

### Restart Frontend
```bash
cd React-Client-ITEC116/frontend
# Stop with Ctrl+C if running
npm run dev
```

### Clear Browser Cache
1. Press Ctrl+Shift+Delete
2. Clear cached images and files
3. Refresh page (Ctrl+F5)

---

## Success Indicators

✅ Backend console shows: `🚀 Server running on port 8000`
✅ Frontend console shows no errors
✅ Network tab shows successful API calls
✅ Page displays "No orders found" or order list
✅ Toast notifications appear when needed

---

## Contact Points

If issues persist:
1. Check all documentation files
2. Verify prerequisites are met
3. Review browser console errors
4. Check backend terminal for errors
5. Test API endpoints directly
