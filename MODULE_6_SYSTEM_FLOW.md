# Module 6 E-Commerce - System Flow Diagram

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ProductCatalog → ShoppingCart → Checkout → OrderManagement     │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express/Node.js)                     │
├─────────────────────────────────────────────────────────────────┤
│  Routes → Controllers → Models → MongoDB                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│  Customer | OnlineOrder | Inventory | SalesOrder                │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Integration Flow (M6 → M1)

### READ Operation Flow
```
User Action: View Product Catalog
    ↓
ProductCatalog.jsx
    ↓
GET /api/ecommerce/products/all
    ↓
ecommerce.controller.js → getProducts()
    ↓
READ from Inventory Model (Module 1) ⚠️ CRITICAL READ
    ↓
Return products with real-time stock
    ↓
Display in UI with stock quantity
```

### WRITE Operation Flow (Order Creation)
```
User Action: Place Order
    ↓
Checkout.jsx → handlePlaceOrder()
    ↓
POST /api/ecommerce/orders/create
    ↓
ecommerce.controller.js → createOrder()
    ↓
Step 1: Validate Customer
    ↓
Step 2: READ Inventory Stock (Module 1) ⚠️ CRITICAL READ
    ↓
Step 3: Validate Stock Availability
    ↓
Step 4: Create OnlineOrder
    ↓
Step 5: WRITE to Inventory (Deduct Stock) ⚠️ CRITICAL WRITE
    │   Inventory.findByIdAndUpdate({ $inc: { quantity: -qty } })
    ↓
Step 6: Create SalesOrder (Module 8 Integration)
    ↓
Return Success Response
    ↓
Display Order Confirmation
```

## Detailed User Journey

### Journey 1: Browse and Purchase

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User navigates to /ecommerce/catalog                      │
│    - ProductCatalog.jsx loads                                │
│    - Fetches products from inventory (READ M1)               │
│    - Displays products with stock levels                     │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. User clicks "Add to Cart" on a product                    │
│    - Validates stock availability (READ M1) ⚠️               │
│    - If stock available: adds to localStorage cart           │
│    - If insufficient: shows error message                    │
│    - Updates cart counter                                    │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. User clicks "View Cart"                                   │
│    - Navigates to /ecommerce/cart                            │
│    - ShoppingCart.jsx loads                                  │
│    - Displays cart items with quantities                     │
│    - Shows available stock for each item                     │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. User updates quantities or removes items                  │
│    - Each quantity change validates stock (READ M1) ⚠️       │
│    - Prevents exceeding available stock                      │
│    - Updates cart total                                      │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. User clicks "Proceed to Checkout"                         │
│    - Validates all items stock (READ M1) ⚠️                  │
│    - If all valid: navigates to /ecommerce/checkout          │
│    - If any invalid: shows error and refreshes stock         │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. User selects/creates customer                             │
│    - Checkout.jsx loads                                      │
│    - Displays order summary                                  │
│    - User selects existing customer OR creates new           │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. User clicks "Place Order"                                 │
│    - Validates customer selected                             │
│    - Sends order to backend                                  │
│    - Backend validates stock (READ M1) ⚠️                    │
│    - Backend creates order                                   │
│    - Backend deducts inventory (WRITE M1) ⚠️ CRITICAL        │
│    - Backend creates sales order (WRITE M8)                  │
│    - Clears cart                                             │
│    - Shows success message with order number                 │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 8. User navigates to /ecommerce/orders                       │
│    - OrderManagement.jsx loads                               │
│    - Displays all orders with status                         │
│    - Can update order status                                 │
│    - Can update payment status                               │
│    - Can cancel order (restores inventory) ⚠️                │
└──────────────────────────────────────────────────────────────┘
```

### Journey 2: Order Cancellation

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User navigates to /ecommerce/orders                       │
│    - Views list of all orders                                │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. User clicks "Cancel" on an order                          │
│    - Confirmation dialog appears                             │
│    - User confirms cancellation                              │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend processes cancellation                            │
│    - Finds order by ID                                       │
│    - Validates order not already cancelled                   │
│    - Loops through order items                               │
│    - WRITES to Inventory (Restore Stock) ⚠️ CRITICAL         │
│    │   Inventory.findByIdAndUpdate({ $inc: { quantity: +qty }})│
│    - Updates order status to "cancelled"                     │
│    - Updates sales order status to "cancelled"               │
└──────────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. User sees success message                                 │
│    - Order status shows "Cancelled"                          │
│    - Inventory has been restored                             │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Order Creation Data Flow

```
┌─────────────┐
│   Customer  │
│   Selects   │
│   Products  │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────────────────────┐
│                    Shopping Cart                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Product A: Qty 5  (Stock: 100) ✓                │   │
│  │ Product B: Qty 3  (Stock: 50)  ✓                │   │
│  │ Product C: Qty 2  (Stock: 10)  ✓                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       ↓ Validate Stock (READ M1)
┌─────────────────────────────────────────────────────────┐
│              Inventory Module (M1)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Product A: 100 units → Check: 5 ≤ 100 ✓         │   │
│  │ Product B: 50 units  → Check: 3 ≤ 50  ✓         │   │
│  │ Product C: 10 units  → Check: 2 ≤ 10  ✓         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       ↓ All Valid
┌─────────────────────────────────────────────────────────┐
│              Create Online Order                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Order Number: ORD-1234567890-1                   │   │
│  │ Customer: John Doe                               │   │
│  │ Items: 3 products                                │   │
│  │ Total: $500.00                                   │   │
│  │ Status: pending                                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       ↓ Deduct Inventory (WRITE M1) ⚠️ CRITICAL
┌─────────────────────────────────────────────────────────┐
│              Inventory Module (M1)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Product A: 100 → 95 units (-5)                   │   │
│  │ Product B: 50  → 47 units (-3)                   │   │
│  │ Product C: 10  → 8  units (-2)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       ↓ Create Sales Order (WRITE M8)
┌─────────────────────────────────────────────────────────┐
│              Sales Module (M8)                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Sales Order ID: 507f1f77bcf86cd799439011         │   │
│  │ Customer: John Doe                               │   │
│  │ Product: Product A                               │   │
│  │ Quantity: 5                                      │   │
│  │ Total: $500.00                                   │   │
│  │ Status: pending                                  │   │
│  │ Invoice Status: unpaid                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────────┐
│              Order Confirmation                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Order placed successfully!                     │   │
│  │ Order Number: ORD-1234567890-1                   │   │
│  │ Inventory has been updated.                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Integration Points Summary

### Module 6 → Module 1 (Inventory)

| Operation | Type | Endpoint | Purpose |
|-----------|------|----------|---------|
| Get Products | READ | `GET /api/ecommerce/products/all` | Display catalog |
| Get Product | READ | `GET /api/ecommerce/products/:id` | Check stock |
| Validate Stock | READ | `POST /api/ecommerce/products/validate-stock` | Pre-checkout validation |
| Create Order | WRITE | `POST /api/ecommerce/orders/create` | Deduct inventory |
| Cancel Order | WRITE | `PUT /api/ecommerce/orders/cancel/:id` | Restore inventory |

### Module 6 → Module 8 (Sales)

| Operation | Type | Purpose |
|-----------|------|---------|
| Create Order | WRITE | Create SalesOrder record |
| Update Status | WRITE | Sync order status |
| Update Payment | WRITE | Sync invoice status |

## Error Handling Flow

```
User Action
    ↓
Frontend Validation
    ├─ Valid → Continue
    └─ Invalid → Show Error Message
         ↓
Backend Validation
    ├─ Valid → Process Request
    │    ↓
    │  Database Operation
    │    ├─ Success → Return Success Response
    │    └─ Error → Rollback & Return Error
    │         ↓
    │    Frontend Shows Error
    │
    └─ Invalid → Return Error Response
         ↓
    Frontend Shows Error
```

## Testing Verification Points

### ✅ Checkpoint 1: Product Display
- Products show in catalog
- Stock quantities match inventory
- Out of stock items marked correctly

### ✅ Checkpoint 2: Cart Validation
- Cannot add more than available stock
- Stock validation on quantity update
- Error messages display correctly

### ✅ Checkpoint 3: Order Creation
- Order created successfully
- Inventory quantity decreased
- Sales order created
- Order number generated

### ✅ Checkpoint 4: Order Cancellation
- Order status changes to cancelled
- Inventory quantity restored
- Sales order status updated

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Stock Read Accuracy | 100% | Real-time inventory display |
| Stock Write Accuracy | 100% | Correct deduction/restoration |
| Order Success Rate | 100% | All valid orders complete |
| Error Prevention | 100% | No overselling possible |
| Data Consistency | 100% | Inventory always accurate |
| Integration Success | 100% | M1 and M8 sync correctly |
