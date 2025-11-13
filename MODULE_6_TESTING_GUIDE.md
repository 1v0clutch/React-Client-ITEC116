# Module 6 E-Commerce - Quick Testing Guide

## Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. MongoDB connected and running
4. Some inventory items already created in Module 1

## Quick Test Scenario

### Step 1: Prepare Test Data
1. Go to **Inventory Management** (`/inventory/inventory-management`)
2. Create a test product or note an existing product:
   - Example: "Laptop" with SKU "LAP-001", Quantity: 100

### Step 2: Test READ Integration (M6 → M1)
1. Go to **E-Commerce Product Catalog** (`/ecommerce/catalog`)
2. **Verify:** The "Laptop" appears with stock showing 100 units
3. Click "Add to Cart"
4. **Verify:** Item added to cart, cart counter shows (1)
5. Click "Add to Cart" again multiple times
6. **Verify:** Cart counter increases
7. Try to add more than 100 units total
8. **Verify:** System prevents adding more than available stock

### Step 3: Test WRITE Integration (M6 → M1)
1. Click "View Cart" button
2. Set quantity to 10 for "Laptop"
3. Click "Proceed to Checkout"
4. **Create a test customer:**
   - Name: John Doe
   - Email: john@example.com
   - Phone: 555-1234
   - Address: 123 Main St, City, State, 12345, USA
5. Click "Save Customer"
6. Click "Place Order"
7. **Verify:** Success message appears with order number
8. Go back to **Inventory Management**
9. **Verify:** "Laptop" stock is now 90 (reduced by 10) ✅ CRITICAL TEST

### Step 4: Test Sales Integration (M6 → M8)
1. Go to **Sales Orders** (`/sales/sales-order`)
2. **Verify:** A new sales order exists for the laptop purchase
3. **Verify:** Order details match the e-commerce order

### Step 5: Test Order Cancellation (Inventory Restoration)
1. Go to **Order Management** (`/ecommerce/orders`)
2. Find the order you just created
3. Click "Cancel" button
4. Confirm cancellation
5. **Verify:** Order status changes to "Cancelled"
6. Go back to **Inventory Management**
7. **Verify:** "Laptop" stock is restored to 100 ✅ CRITICAL TEST

## Expected Results Summary

| Test | Action | Expected Result |
|------|--------|----------------|
| READ | View product catalog | Shows current inventory stock |
| READ | Add to cart | Validates stock availability |
| READ | Update cart quantity | Validates against current stock |
| WRITE | Place order | Inventory decreases by ordered quantity |
| WRITE | Cancel order | Inventory increases (restored) |
| Integration | Place order | Creates sales order in Module 8 |

## Common Issues & Solutions

### Issue: Products not showing in catalog
**Solution:** 
- Ensure you have inventory items created in Module 1
- All inventory items will show in the catalog (even with 0 stock)
- Items with 0 stock will show "Out of Stock" button

### Issue: "Insufficient stock" error
**Solution:** Check current inventory stock in Module 1, may have been depleted

### Issue: Order not creating
**Solution:** 
- Verify customer is selected
- Verify cart has items
- Check backend console for errors

### Issue: Inventory not updating
**Solution:**
- Verify backend is running
- Check MongoDB connection
- Verify API endpoint is correct (http://localhost:8000)

## API Testing with Postman/Thunder Client

### Test Stock Validation (READ)
```
POST http://localhost:8000/api/ecommerce/products/validate-stock
Content-Type: application/json

{
  "items": [
    {
      "productId": "YOUR_PRODUCT_ID",
      "quantity": 5
    }
  ]
}
```

### Test Order Creation (WRITE)
```
POST http://localhost:8000/api/ecommerce/orders/create
Content-Type: application/json

{
  "customerId": "YOUR_CUSTOMER_ID",
  "items": [
    {
      "productId": "YOUR_PRODUCT_ID",
      "quantity": 5
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

## Evidence Collection for Report

### Screenshots to Capture:
1. ✅ Inventory before order (showing stock quantity)
2. ✅ E-Commerce product catalog (showing same stock)
3. ✅ Shopping cart with items
4. ✅ Order confirmation message
5. ✅ Inventory after order (showing reduced stock)
6. ✅ Sales order created in Module 8
7. ✅ Order management page
8. ✅ Inventory after cancellation (showing restored stock)

### Data to Record:
- Starting inventory quantity
- Order quantity
- Final inventory quantity after order
- Final inventory quantity after cancellation
- Order number
- Sales order ID

## Navigation Quick Reference

| Module | Path | Purpose |
|--------|------|---------|
| Inventory | `/inventory/inventory-management` | View/manage inventory |
| E-Commerce Catalog | `/ecommerce/catalog` | Browse products |
| Shopping Cart | `/ecommerce/cart` | Manage cart |
| Checkout | `/ecommerce/checkout` | Place orders |
| Order Management | `/ecommerce/orders` | Manage orders |
| Sales Orders | `/sales/sales-order` | View sales orders |

## Success Criteria

✅ Products display with real-time inventory stock
✅ Cannot add more items to cart than available stock
✅ Order placement reduces inventory quantity
✅ Order cancellation restores inventory quantity
✅ Sales order is created when e-commerce order is placed
✅ Order and payment status can be updated
✅ All operations complete without errors

## Time Estimate
- Complete testing: 15-20 minutes
- Evidence collection: 5-10 minutes
- Total: 20-30 minutes
