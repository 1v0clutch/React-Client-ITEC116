# Module 6 Diagram Implementation

## Overview
Module 6 (E-Commerce) has been successfully added to the BackendDesign-Week4.drawio diagram following the same structure and pattern as other modules.

## What Was Added

### 1. Module 6 Label Box
- **Position**: Top right area (x: 350, y: 80)
- **Color**: Green (#d5e8d4 fill, #82b366 stroke)
- **Size**: 120x60 pixels
- **Purpose**: Identifies the E-Commerce module

### 2. Customer Entity
- **Position**: Right of Module 6 label (x: 500, y: 50)
- **Color**: Green (#d5e8d4 fill, #82b366 stroke)
- **Size**: 140x240 pixels
- **Fields**:
  - _id
  - name
  - email
  - phone
  - address

### 3. OnlineOrder Entity
- **Position**: Right of Customer (x: 670, y: 50)
- **Color**: Green (#d5e8d4 fill, #82b366 stroke)
- **Size**: 160x330 pixels
- **Fields**:
  - _id
  - customerId
  - items
  - totalAmount
  - status
  - paymentStatus
  - shippingAddress
  - salesOrderId

## Connections Added

### 1. Customer → OnlineOrder (One-to-Many)
- Shows that one customer can have multiple orders
- Represented by a line with crow's foot notation on the OnlineOrder side

### 2. OnlineOrder → Inventory (Module 1)
- Shows that online orders read from and update inventory
- Connection line goes from OnlineOrder to the Inventory entity
- Indicates the integration between Module 6 and Module 1

## Design Consistency

The Module 6 implementation follows the same pattern as existing modules:

### Module 1 (Inventory)
- **Color**: Blue (#dae8fc fill, #6c8ebf stroke)
- **Entities**: Inventory, Warehouse
- **Pattern**: Label box + entity boxes with fields

### Module 3 (Procurement)
- **Color**: Pink (#f8cecc fill, #b85450 stroke)
- **Entities**: Suppliers, Requisitions, PurchaseOrders, Invoice
- **Pattern**: Label box + entity boxes with fields + connections

### Module 6 (E-Commerce) - NEW
- **Color**: Green (#d5e8d4 fill, #82b366 stroke)
- **Entities**: Customer, OnlineOrder
- **Pattern**: Label box + entity boxes with fields + connections

## Module 6 Functionality

Based on the implementation, Module 6 provides:

1. **Product Catalog** - Displays inventory items for online shopping
2. **Shopping Cart** - Manages customer cart items
3. **Checkout Process** - Handles order placement
4. **Order Management** - Tracks and manages online orders

## Integration Points

### Module 6 → Module 1 (Inventory)
- **READ**: Product catalog displays real-time inventory
- **READ**: Stock validation before adding to cart
- **WRITE**: Inventory automatically deducted on order
- **WRITE**: Inventory automatically restored on cancellation

### Module 6 → Module 8 (Sales)
- **WRITE**: Sales order automatically created on checkout
- **WRITE**: Sales order ID linked to online order (salesOrderId field)
- **WRITE**: Status updates sync between modules

## Visual Representation

```
Module 6 (E-Commerce)
├── Customer
│   ├── _id
│   ├── name
│   ├── email
│   ├── phone
│   └── address
│
└── OnlineOrder
    ├── _id
    ├── customerId ──→ Customer
    ├── items ──→ Inventory (Module 1)
    ├── totalAmount
    ├── status
    ├── paymentStatus
    ├── shippingAddress
    └── salesOrderId ──→ SalesOrder (Module 8)
```

## File Location
- **Diagram File**: `React-Client-ITEC116/ecommerce-frontend/BackendDesign-Week4.drawio`
- **Backup File**: `React-Client-ITEC116/ecommerce-frontend/BackendDesign-Week4.drawio.backup`

## How to View
1. Open the file in draw.io (https://app.diagrams.net/)
2. Or use the draw.io desktop application
3. Or use the draw.io VS Code extension

## Notes
- The diagram maintains consistency with existing module styles
- Green color distinguishes Module 6 from other modules
- Entity relationships are clearly shown with connection lines
- All fields are listed in a simple, readable format
- The implementation is not overly detailed, matching the level of detail in other modules

---

*Last Updated: November 24, 2025*
*Status: COMPLETE*
