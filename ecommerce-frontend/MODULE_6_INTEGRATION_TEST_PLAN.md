# Module 6: E-Commerce System - Integration Testing Plan

## Test Case 1: Module 6 Internal Functionality Testing

| TEST CASE ID | TC001 |
|--------------|-------|
| **TEST SCENARIOS** | Complete E-Commerce Order Flow (Module 6 Only) |
| **TEST CASE** | Verify that Module 6 can successfully create customers, manage shopping cart, process orders, and update order statuses without external module dependencies |
| **PRE-CONDITION** | 1. Backend server running on port 8000<br>2. Frontend running on port 5173<br>3. MongoDB connected<br>4. At least 3 products exist in inventory with stock > 5 |
| **TEST STEPS** | **Step 1: Customer Management**<br>1.1. Navigate to `/ecommerce/checkout`<br>1.2. Click "Create New Customer"<br>1.3. Fill in customer details:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Name: "Juan Dela Cruz"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Email: "juan.delacruz@test.com"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Phone: "09171234567"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Address: Complete address fields<br>1.4. Click "Save Customer"<br><br>**Step 2: Product Catalog Browsing**<br>2.1. Navigate to `/ecommerce/catalog`<br>2.2. Verify all products are displayed<br>2.3. Check that each product shows:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product name and SKU<br>&nbsp;&nbsp;&nbsp;&nbsp;- Price in Peso (₱)<br>&nbsp;&nbsp;&nbsp;&nbsp;- Stock quantity<br>&nbsp;&nbsp;&nbsp;&nbsp;- "Add to Cart" button (enabled if stock > 0)<br><br>**Step 3: Shopping Cart Operations**<br>3.1. Add Product A (quantity: 2) to cart<br>3.2. Add Product B (quantity: 1) to cart<br>3.3. Add Product C (quantity: 3) to cart<br>3.4. Click "View Cart"<br>3.5. Verify cart displays all 3 products with correct quantities<br>3.6. Update Product A quantity to 3<br>3.7. Remove Product C from cart<br>3.8. Verify cart now shows 2 products<br>3.9. Verify total amount calculation is correct<br><br>**Step 4: Order Creation**<br>4.1. Click "Proceed to Checkout"<br>4.2. Select customer "Juan Dela Cruz"<br>4.3. Verify order summary shows correct items and total<br>4.4. Click "Place Order"<br>4.5. Wait for success message with order number<br>4.6. Verify redirect to `/ecommerce/orders`<br><br>**Step 5: Order Management**<br>5.1. Verify new order appears in order list<br>5.2. Check order details:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Order number is unique<br>&nbsp;&nbsp;&nbsp;&nbsp;- Customer name matches<br>&nbsp;&nbsp;&nbsp;&nbsp;- Item count is correct<br>&nbsp;&nbsp;&nbsp;&nbsp;- Total amount matches<br>&nbsp;&nbsp;&nbsp;&nbsp;- Status is "pending"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Payment status is "unpaid"<br>5.3. Click "View" to see order details<br>5.4. Verify all order information is displayed correctly<br><br>**Step 6: Order Status Updates**<br>6.1. Change order status to "processing"<br>6.2. Verify status updates successfully<br>6.3. Change payment status to "paid"<br>6.4. Verify payment status updates successfully<br>6.5. Change order status to "shipped"<br>6.6. Verify status updates successfully |
| **TEST DATA** | **Customer Data:**<br>- Name: Juan Dela Cruz<br>- Email: juan.delacruz@test.com<br>- Phone: 09171234567<br>- Street: 123 Rizal Street<br>- City: Manila<br>- State: Metro Manila<br>- ZipCode: 1000<br>- Country: Philippines<br><br>**Cart Items:**<br>- Product A: Qty 2 (updated to 3)<br>- Product B: Qty 1<br>- Product C: Qty 3 (removed)<br><br>**Status Updates:**<br>- Order: pending → processing → shipped<br>- Payment: unpaid → paid |
| **EXPECTED RESULT** | 1. Customer created successfully with unique email<br>2. Product catalog displays all products with correct information<br>3. Cart operations (add, update, remove) work correctly<br>4. Total amount calculates accurately<br>5. Order created with unique order number<br>6. Order appears in order management list<br>7. Order details are accurate and complete<br>8. Status updates apply successfully<br>9. Payment status updates independently from order status<br>10. All data persists correctly in database |
| **ACTUAL RESULT** | _(To be filled during testing)_ |
| **STATUS (PASS/FAIL)** | _(To be filled during testing)_ |

---

## Test Case 2: Module 6 → Module 1 Integration (Inventory Read Operations)

| TEST CASE ID | TC002 |
|--------------|-------|
| **TEST SCENARIOS** | E-Commerce Product Catalog Fetches Data from Inventory Module |
| **TEST CASE** | Verify that Module 6 correctly reads and displays product data from Module 1 (Inventory) in real-time |
| **PRE-CONDITION** | 1. Backend server running<br>2. Frontend running<br>3. Module 1 has products with varying stock levels:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product "Laptop": Stock 50<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product "Mouse": Stock 0<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product "Keyboard": Stock 15 |
| **TEST STEPS** | **Step 1: Verify Product Catalog Data Fetch**<br>1.1. Navigate to `/ecommerce/catalog`<br>1.2. Open browser DevTools Network tab<br>1.3. Verify API call to `GET /api/ecommerce/products/all`<br>1.4. Check response contains inventory data<br>1.5. Verify products displayed match inventory records<br><br>**Step 2: Verify Real-Time Stock Display**<br>2.1. Check "Laptop" shows stock: 50<br>2.2. Check "Mouse" shows stock: 0 with "Out of Stock" button<br>2.3. Check "Keyboard" shows stock: 15<br>2.4. Verify prices display in Peso (₱)<br><br>**Step 3: Verify Stock Validation on Cart Add**<br>3.1. Try to add "Mouse" (stock 0) to cart<br>3.2. Verify error message: "Insufficient stock!"<br>3.3. Add "Laptop" to cart successfully<br>3.4. Open DevTools Network tab<br>3.5. Verify API call to `GET /api/ecommerce/products/:id`<br>3.6. Confirm real-time stock check occurred<br><br>**Step 4: Verify Stock Validation on Quantity Update**<br>4.1. Navigate to `/ecommerce/cart`<br>4.2. Try to update "Laptop" quantity to 100 (exceeds stock of 50)<br>4.3. Verify error message shows available stock<br>4.4. Update quantity to 10 (within stock)<br>4.5. Verify update succeeds<br><br>**Step 5: Verify Batch Stock Validation at Checkout**<br>5.1. Add "Keyboard" (qty: 5) to cart<br>5.2. Click "Proceed to Checkout"<br>5.3. Open DevTools Network tab<br>5.4. Verify API call to `POST /api/ecommerce/products/validate-stock`<br>5.5. Check request payload contains all cart items<br>5.6. Verify response confirms all items available<br><br>**Step 6: Cross-Module Data Consistency**<br>6.1. Open Module 1 Inventory page in new tab<br>6.2. Note "Laptop" stock: 50<br>6.3. Return to Module 6 catalog<br>6.4. Verify "Laptop" stock matches: 50<br>6.5. Confirm data consistency between modules |
| **TEST DATA** | **Inventory Products (Module 1):**<br>- Laptop: Stock 50, Price ₱45000<br>- Mouse: Stock 0, Price ₱500<br>- Keyboard: Stock 15, Price ₱1200<br><br>**Cart Operations:**<br>- Add Laptop: Qty 10<br>- Add Keyboard: Qty 5<br>- Attempt Mouse: Qty 1 (should fail)<br>- Attempt Laptop: Qty 100 (should fail) |
| **EXPECTED RESULT** | 1. Product catalog fetches data from Module 1 successfully<br>2. All product details match inventory records exactly<br>3. Stock quantities display in real-time<br>4. Out-of-stock products show disabled "Add to Cart" button<br>5. Stock validation prevents adding unavailable items<br>6. Stock validation prevents exceeding available quantities<br>7. Batch validation checks all cart items before checkout<br>8. Data consistency maintained between Module 1 and Module 6<br>9. API calls to inventory endpoints return correct data<br>10. Error messages display accurate stock information |
| **ACTUAL RESULT** | _(To be filled during testing)_ |
| **STATUS (PASS/FAIL)** | _(To be filled during testing)_ |

---

## Test Case 3: Module 6 → Module 1 Integration (Inventory Write Operations)

| TEST CASE ID | TC003 |
|--------------|-------|
| **TEST SCENARIOS** | E-Commerce Order Creation Deducts Inventory and Order Cancellation Restores Inventory |
| **TEST CASE** | Verify that Module 6 correctly updates inventory quantities in Module 1 when orders are created and cancelled |
| **PRE-CONDITION** | 1. Backend server running<br>2. Frontend running<br>3. Module 1 Inventory has:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product "Laptop": Stock 50<br>&nbsp;&nbsp;&nbsp;&nbsp;- Product "Monitor": Stock 30<br>4. Customer "Test Customer" exists<br>5. Cart is empty |
| **TEST STEPS** | **Step 1: Record Initial Inventory**<br>1.1. Navigate to `/inventory/inventory-management` (Module 1)<br>1.2. Note "Laptop" stock: 50<br>1.3. Note "Monitor" stock: 30<br>1.4. Take screenshot for evidence<br><br>**Step 2: Create Order in Module 6**<br>2.1. Navigate to `/ecommerce/catalog`<br>2.2. Add "Laptop" (qty: 3) to cart<br>2.3. Add "Monitor" (qty: 2) to cart<br>2.4. Proceed to checkout<br>2.5. Select "Test Customer"<br>2.6. Click "Place Order"<br>2.7. Wait for success message<br>2.8. Note the order number<br><br>**Step 3: Verify Inventory Deduction**<br>3.1. Navigate to `/inventory/inventory-management` (Module 1)<br>3.2. Check "Laptop" stock: Should be 47 (50 - 3)<br>3.3. Check "Monitor" stock: Should be 28 (30 - 2)<br>3.4. Take screenshot for evidence<br>3.5. Verify updatedAt timestamp changed<br><br>**Step 4: Verify Atomic Deduction**<br>4.1. Check MongoDB database directly<br>4.2. Query Inventory collection for "Laptop"<br>4.3. Verify quantity field is exactly 47<br>4.4. Query Inventory collection for "Monitor"<br>4.5. Verify quantity field is exactly 28<br><br>**Step 5: Cancel Order in Module 6**<br>5.1. Navigate to `/ecommerce/orders`<br>5.2. Find the order created in Step 2<br>5.3. Click "Cancel" button<br>5.4. Confirm cancellation<br>5.5. Wait for success message: "Inventory has been restored"<br>5.6. Verify order status changed to "cancelled"<br><br>**Step 6: Verify Inventory Restoration**<br>6.1. Navigate to `/inventory/inventory-management` (Module 1)<br>6.2. Check "Laptop" stock: Should be 50 (restored)<br>6.3. Check "Monitor" stock: Should be 30 (restored)<br>6.4. Take screenshot for evidence<br>6.5. Verify updatedAt timestamp changed again<br><br>**Step 7: Test Multiple Order Scenario**<br>7.1. Create Order A: Laptop (qty: 5)<br>7.2. Verify inventory: Laptop = 45<br>7.3. Create Order B: Laptop (qty: 3)<br>7.4. Verify inventory: Laptop = 42<br>7.5. Cancel Order A<br>7.6. Verify inventory: Laptop = 47 (42 + 5)<br>7.7. Cancel Order B<br>7.8. Verify inventory: Laptop = 50 (47 + 3) |
| **TEST DATA** | **Initial Inventory:**<br>- Laptop: 50 units<br>- Monitor: 30 units<br><br>**Order 1:**<br>- Laptop: 3 units<br>- Monitor: 2 units<br>- Expected after order: Laptop 47, Monitor 28<br>- Expected after cancel: Laptop 50, Monitor 30<br><br>**Order A:**<br>- Laptop: 5 units<br><br>**Order B:**<br>- Laptop: 3 units |
| **EXPECTED RESULT** | 1. Order creation triggers inventory deduction in Module 1<br>2. Inventory quantities decrease by exact order amounts<br>3. Deduction is atomic (no partial updates)<br>4. updatedAt timestamp updates in Module 1<br>5. Order cancellation triggers inventory restoration<br>6. Inventory quantities increase by exact order amounts<br>7. Restoration is atomic (no partial updates)<br>8. Multiple orders deduct correctly<br>9. Multiple cancellations restore correctly<br>10. Final inventory matches initial inventory after all cancellations<br>11. No inventory discrepancies or data loss |
| **ACTUAL RESULT** | _(To be filled during testing)_ |
| **STATUS (PASS/FAIL)** | _(To be filled during testing)_ |

---

## Test Case 4: Module 6 → Module 8 Integration (Sales Order Creation & Synchronization)

| TEST CASE ID | TC004 |
|--------------|-------|
| **TEST SCENARIOS** | E-Commerce Order Automatically Creates Sales Orders and Synchronizes Status Updates |
| **TEST CASE** | Verify that Module 6 automatically creates corresponding sales orders in Module 8 and synchronizes status changes bidirectionally |
| **PRE-CONDITION** | 1. Backend server running<br>2. Frontend running<br>3. Module 1 has products with sufficient stock<br>4. Customer exists in Module 6<br>5. Module 8 Sales Order page accessible |
| **TEST STEPS** | **Step 1: Record Initial State**<br>1.1. Navigate to `/sales/sales-order` (Module 8)<br>1.2. Count existing sales orders<br>1.3. Note the count (e.g., 10 orders)<br>1.4. Take screenshot<br><br>**Step 2: Create Multi-Item Order in Module 6**<br>2.1. Navigate to `/ecommerce/catalog`<br>2.2. Add Product A (qty: 2) to cart<br>2.3. Add Product B (qty: 1) to cart<br>2.4. Add Product C (qty: 3) to cart<br>2.5. Proceed to checkout<br>2.6. Select customer<br>2.7. Click "Place Order"<br>2.8. Note the online order number<br>2.9. Wait for success message<br><br>**Step 3: Verify Sales Order Creation in Module 8**<br>3.1. Navigate to `/sales/sales-order` (Module 8)<br>3.2. Verify 3 new sales orders created (one per cart item)<br>3.3. Count should be 13 (10 + 3)<br>3.4. Check each sales order:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Sales Order 1: Product A, Qty 2<br>&nbsp;&nbsp;&nbsp;&nbsp;- Sales Order 2: Product B, Qty 1<br>&nbsp;&nbsp;&nbsp;&nbsp;- Sales Order 3: Product C, Qty 3<br>3.5. Verify each sales order has:<br>&nbsp;&nbsp;&nbsp;&nbsp;- Status: "pending"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Invoice Status: "unpaid"<br>&nbsp;&nbsp;&nbsp;&nbsp;- Total includes 12% tax<br>3.6. Take screenshot<br><br>**Step 4: Verify Sales Order Linkage**<br>4.1. Navigate to `/ecommerce/orders`<br>4.2. Click "View" on the created order<br>4.3. Verify "salesOrderIds" field contains 3 IDs<br>4.4. Copy the 3 sales order IDs<br>4.5. Navigate to Module 8<br>4.6. Verify the 3 sales orders match the IDs<br><br>**Step 5: Test Status Synchronization (Module 6 → Module 8)**<br>5.1. Navigate to `/ecommerce/orders`<br>5.2. Change online order status to "processing"<br>5.3. Navigate to `/sales/sales-order` (Module 8)<br>5.4. Verify all 3 linked sales orders status changed to "processing"<br>5.5. Return to Module 6<br>5.6. Change online order status to "shipped"<br>5.7. Return to Module 8<br>5.8. Verify all 3 linked sales orders status changed to "shipped"<br><br>**Step 6: Test Payment Status Synchronization**<br>6.1. Navigate to `/ecommerce/orders`<br>6.2. Change payment status to "paid"<br>6.3. Navigate to `/sales/sales-order` (Module 8)<br>6.4. Verify all 3 linked sales orders invoice status changed to "paid"<br><br>**Step 7: Test Order Cancellation Synchronization**<br>7.1. Navigate to `/ecommerce/orders`<br>7.2. Click "Cancel" on the order<br>7.3. Confirm cancellation<br>7.4. Verify order status changed to "cancelled"<br>7.5. Navigate to `/sales/sales-order` (Module 8)<br>7.6. Verify all 3 linked sales orders status changed to "cancelled"<br><br>**Step 8: Verify Tax Calculation**<br>8.1. Create new order with Product D (price: ₱1000, qty: 1)<br>8.2. Navigate to Module 8<br>8.3. Find the new sales order<br>8.4. Verify total amount = ₱1120 (₱1000 + 12% tax)<br>8.5. Verify tax field shows 12 |
| **TEST DATA** | **Cart Items:**<br>- Product A: Qty 2, Price ₱500 each<br>- Product B: Qty 1, Price ₱1000<br>- Product C: Qty 3, Price ₱300 each<br><br>**Expected Sales Orders:**<br>- SO1: Product A, Qty 2, Total ₱1120 (₱1000 + 12%)<br>- SO2: Product B, Qty 1, Total ₱1120 (₱1000 + 12%)<br>- SO3: Product C, Qty 3, Total ₱1008 (₱900 + 12%)<br><br>**Status Changes:**<br>- pending → processing → shipped → cancelled<br>- unpaid → paid |
| **EXPECTED RESULT** | 1. One online order creates multiple sales orders (one per item)<br>2. Sales orders appear in Module 8 immediately<br>3. Each sales order has correct product and quantity<br>4. Sales orders include 12% tax calculation<br>5. salesOrderIds array in online order contains all linked IDs<br>6. Status changes in Module 6 propagate to Module 8<br>7. All linked sales orders update simultaneously<br>8. Payment status changes propagate correctly<br>9. Order cancellation updates all linked sales orders<br>10. No orphaned sales orders created<br>11. Data consistency maintained between modules |
| **ACTUAL RESULT** | _(To be filled during testing)_ |
| **STATUS (PASS/FAIL)** | _(To be filled during testing)_ |

---

## Test Execution Guidelines

### Pre-Testing Checklist
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connected and accessible
- [ ] All modules (1, 6, 8) are functional
- [ ] Test data prepared in inventory
- [ ] Browser DevTools ready for network monitoring
- [ ] Screenshot tool ready for evidence collection

### Testing Sequence
1. Execute TC001 first (Module 6 internal functionality)
2. Execute TC002 (Read integration with Module 1)
3. Execute TC003 (Write integration with Module 1)
4. Execute TC004 (Integration with Module 8)

### Evidence Collection
For each test case, collect:
- Screenshots of initial state
- Screenshots of actions performed
- Screenshots of final state
- Network tab logs (API calls)
- Database queries (if applicable)
- Error messages (if any)

### Pass/Fail Criteria
- **PASS**: All expected results match actual results
- **FAIL**: Any expected result does not match actual result

### Reporting
Document all findings in the "ACTUAL RESULT" and "STATUS" columns. Include:
- What worked as expected
- What failed (if any)
- Error messages encountered
- Screenshots as evidence
- Recommendations for fixes (if needed)

---

*Test Plan Version: 1.0*  
*Created: November 24, 2025*  
*Module: E-Commerce System (Module 6)*  
*Integration Points: Module 1 (Inventory), Module 8 (Sales)*
