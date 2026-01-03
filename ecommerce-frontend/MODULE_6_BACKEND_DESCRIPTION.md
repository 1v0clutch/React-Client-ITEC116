# Module 6: E-Commerce System - Backend Architecture

## System Overview

Module 6 is an e-commerce platform that enables online product sales through a customer-facing interface. It acts as an integration layer connecting customers with Inventory Management (Module 1) and Sales Order Management (Module 8). Every purchase triggers coordinated operations across all three modules to maintain real-time inventory accuracy and generate proper sales records.

## Data Models

### Customer Model
Stores buyer information with fields: name, email (unique), phone, and structured address (street, city, state, zipCode, country). Enforces email uniqueness to prevent duplicate accounts. One customer can have multiple orders (one-to-many relationship).

### OnlineOrder Model
Represents complete transactions with nested OrderItemSchema for each product. Key features:
- **Order Items**: References Inventory via productId, stores denormalized product data (name, price) for historical accuracy
- **Sales Integration**: salesOrderIds array links to Module 8 (one cart item = one sales order)
- **Status Tracking**: Separate status (pending→processing→shipped→delivered→cancelled) and paymentStatus (unpaid→paid→refunded)
- **Shipping**: Order-specific address that can differ from customer's default address

## Core Business Logic

### Customer Management
Full CRUD operations with email uniqueness validation. Hard delete preserves order history for audit purposes.

### Product Catalog (Read-Only from Module 1)
- Displays all inventory items with real-time stock levels
- Validates stock at three points: cart addition, cart update, and checkout
- Prevents overselling through multi-layered validation

### Order Processing (6-Step Transaction)
1. **Validate Customer** - Ensures customer exists
2. **Validate Stock** - Checks product availability and calculates totals
3. **Generate Order Number** - Creates unique identifier (timestamp + count)
4. **Save Order** - Persists order document
5. **Deduct Inventory** - Atomically decrements stock using MongoDB $inc operator
6. **Create Sales Orders** - Generates one sales order per cart item in Module 8 (includes 12% tax)

### Status Management
Updates propagate to all linked sales orders automatically. Payment status changes trigger invoice status updates in Module 8.

### Cancellation & Restoration
Cancelling an order atomically restores inventory quantities and updates all linked sales orders to "cancelled" status. Prevents duplicate restoration.

## Module Integration

### Module 1 (Inventory) Integration
**Read Operations**: Queries inventory for product catalog, stock validation (catalog browsing, cart operations, checkout)  
**Write Operations**: Atomic inventory updates using $inc operator
- Order creation: Decrements stock quantities
- Order cancellation: Restores stock quantities
- Prevents race conditions through atomic operations

### Module 8 (Sales) Integration
**One-to-Many Mapping**: Each online order creates multiple sales orders (one per cart item)  
**Data Transformation**: Converts ObjectId customer references to numeric IDs for Module 8 compatibility  
**Automatic Synchronization**: Status and payment changes propagate to all linked sales orders

## Key Technical Features

### Atomic Operations
Uses MongoDB $inc operator for inventory updates to prevent overselling in concurrent scenarios. Order numbers use timestamp + count for uniqueness.

### Data Integrity
- Denormalized product data in orders preserves historical accuracy
- Multi-layer stock validation (cart add, cart update, checkout)
- Compensating transactions for cancellations restore inventory

### Error Handling
Validates at every step: customer existence, product availability, stock sufficiency. Returns detailed error messages with available quantities.

## API Endpoints

### Customer Management (5 endpoints)
- **POST** `/api/ecommerce/customers/create` - Create customer with unique email validation
- **GET** `/api/ecommerce/customers/all` - Retrieve all customers
- **GET** `/api/ecommerce/customers/:id` - Get single customer by ID
- **PUT** `/api/ecommerce/customers/update/:id` - Update customer information
- **DELETE** `/api/ecommerce/customers/delete/:id` - Delete customer (preserves order history)

### Product Catalog (3 endpoints)
- **GET** `/api/ecommerce/products/all` - Get all inventory items from Module 1
- **GET** `/api/ecommerce/products/:id` - Get single product with real-time stock
- **POST** `/api/ecommerce/products/validate-stock` - Batch validate cart items availability

### Order Management (10 endpoints)
- **POST** `/api/ecommerce/orders/create` - Create order (validates customer/stock, deducts inventory, creates sales orders in Module 8)
- **GET** `/api/ecommerce/orders/all` - Get all orders with populated customer/product/sales data
- **GET** `/api/ecommerce/orders/:id` - Get single order with full details
- **GET** `/api/ecommerce/orders/customer/:customerId` - Get customer's order history
- **PUT** `/api/ecommerce/orders/status/:id` - Update order status (syncs to Module 8)
- **PUT** `/api/ecommerce/orders/payment/:id` - Update payment status (syncs invoice status to Module 8)
- **PUT** `/api/ecommerce/orders/cancel/:id` - Cancel order and restore inventory
- **DELETE** `/api/ecommerce/orders/delete/:id` - Delete order (restores inventory if needed)
- **DELETE** `/api/ecommerce/orders/delete-all` - Bulk delete all orders (development/t
**GET /api/ecommerce/products/:id**
Fetches a single product's current information from the inventory system. Returns real-time stock quantity along with all product details. This endpoint is critical for stock validation during cart operations, ensuring customers see accurate availability before adding items. The response includes the current quantity field, which may have changed since the customer initially viewed the catalog.

**POST /api/ecommerce/products/validate-stock**
Performs batch stock validation for multiple products simultaneously. Accepts a JSON payload containing an array of items, each specifying a productId and requested quantity. Returns a validation result object indicating whether all items are available, along with detailed results for each item. For unavailable items, the response includes the reason (product not found or insufficient stock), requested quantity, and available quantity. This endpoint is called before checkout to ensure the entire cart can be fulfilled.

### Order Management Endpoints

**POST /api/ecommerce/orders/create**
Executes the complete order creation workflow, including customer validation, stock validation, inventory deduction, and sales order generation. Accepts a JSON payload containing customerId, items array (with productId and quantity for each item), and shippingAddress object. The endpoint performs multi-step validation, calculating order totals and generating a unique order number. Upon successful creation, it atomically decrements inventory quantities and creates corresponding sales orders in Module 8. Returns the created order object with all generated fields including order number, calculated totals, and linked sales order IDs. This is the most complex endpoint in the module, orchestrating operations across three database collections.

**GET /api/ecommerce/orders/all**
Retrieves all orders from the system with full population of related data. The response includes populated customer objects, populated product details for each order item, and populated sales order references. This comprehensive data retrieval supports administrative interfaces where staff need complete order information for processing, customer service, or reporting purposes. The endpoint returns orders in their natural database order without sorting or pagination.

**GET /api/ecommerce/orders/:id**
Fetches a single order by MongoDB ObjectId with full population of related entities. Returns the complete order object including customer details, product information for each item, and linked sales orders. This endpoint supports order detail views in both customer-facing and administrative interfaces. The populated data eliminates the need for multiple API calls to retrieve related information.

**GET /api/ecommerce/orders/customer/:customerId**
Retrieves all orders associated with a specific customer. Returns an array of order objects with populated product and sales order information. This endpoint supports customer order history views, allowing customers to track their purchases and order statuses. The response includes all orders regardless of status, enabling customers to view both active and completed orders.

**PUT /api/ecommerce/orders/status/:id**
Updates an order's operational status while synchronizing the change to all linked sales orders. Accepts a JSON payload containing the new status value, which must be one of the defined enum values (pending, processing, shipped, delivered, cancelled). The endpoint updates the order record and iterates through all salesOrderIds, applying the same status update to each linked sales order. Returns the updated order object with populated related data. This endpoint supports order fulfillment workflows where staff update order status as items are processed and shipped.

**PUT /api/ecommerce/orders/payment/:id**
Updates an order's payment status and synchronizes financial state to linked sales orders. Accepts a JSON payload containing the new paymentStatus value (unpaid, paid, refunded). When payment status changes to "paid", the endpoint automatically updates all linked sales orders' invoiceStatus to "paid", maintaining financial consistency across modules. Returns the updated order object. This endpoint supports payment processing workflows and financial reconciliation processes.

**PUT /api/ecommerce/orders/cancel/:id**
Cancels an order and restores inventory quantities for all order items. This endpoint first validates that the order hasn't already been cancelled to prevent duplicate inventory restoration. It then iterates through each order item, atomically incrementing inventory quantities by the originally purchased amounts. After inventory restoration, it updates the order status to "cancelled" and propagates this status to all linked sales orders. Returns the updated order object with a confirmation message. This endpoint supports customer-initiated cancellations and administrative order cancellations, ensuring inventory accuracy is maintained when orders are not fulfilled.

**DELETE /api/ecommerce/orders/delete/:id**
Permanently removes an order from the database while restoring inventory if necessary. If the order wasn't previously cancelled, the endpoint restores inventory quantities before deletion. It also deletes all linked sales orders from Module 8, maintaining referential integrity across modules. Returns a success message upon completion. This endpoint is typically used for removing test orders or handling exceptional cases where orders must be completely removed from the system.

**DELETE /api/ecommerce/orders/delete-all**
Performs a bulk deletion of all orders in the system with inventory restoration. This endpoint iterates through all orders, restoring inventory for non-cancelled orders and deleting linked sales orders. It then performs a deleteMany operation to remove all order records. Returns a success message with the count of deleted orders. This endpoint is primarily used for development and testing purposes, allowing quick database cleanup. It should be restricted in production environments due to its destructive nature.

---

*Document Version: 1.0*  
*Last Updated: November 24, 2025*  
*Module: E-Commerce System (Module 6)*  
*Integration Points: Inventory Management (Module 1), Sales Order Management (Module 8)*
