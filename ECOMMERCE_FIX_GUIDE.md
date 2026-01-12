# E-Commerce Fix Guide

## Issues Fixed

1. ✅ **Missing xlsx package** - Installed xlsx, jspdf, and jspdf-autotable for the frontend
2. ✅ **Images not loading** - Added static file serving for /uploads folder in backend
3. ✅ **No products showing** - Created seed script to populate sample products

## Quick Start

### 1. Start Backend Server (Port 8000)

```bash
cd React-Client-ITEC116/backend
npm start
```

Or if using nodemon:
```bash
cd React-Client-ITEC116/backend
nodemon server.js
```

### 2. Seed Sample Products (First Time Only)

```bash
cd React-Client-ITEC116/backend
node utils/seedProducts.js
```

This will add 10 sample products with:
- Product images (from Unsplash)
- Various categories (Electronics, Accessories, Office)
- Different stock levels (including out-of-stock items)
- Realistic prices in PHP

### 3. Start E-Commerce Frontend (Port 3000)

```bash
cd React-Client-ITEC116/ecommerce-frontend
npm run dev
```

### 4. Start Main Frontend (Port 5173)

```bash
cd React-Client-ITEC116/frontend
npm run dev
```

## Testing the E-Commerce Portal

1. **View Products**: Navigate to http://localhost:3000
   - You should see 10 products with images
   - Filter by category, stock status, or search

2. **Add to Cart**: Click "Add to Cart" on any product
   - Cart counter updates in header
   - Stock validation happens in real-time

3. **Checkout**: 
   - Go to cart and proceed to checkout
   - Fill in customer details
   - Place order (inventory will be deducted)

4. **Order Management**:
   - View all orders
   - Update order status
   - Update payment status
   - Cancel orders (restores inventory)

## Troubleshooting

### Products Not Showing
- Make sure backend is running on port 8000
- Check if products exist: `GET http://localhost:8000/api/ecommerce/products/all`
- Run seed script if no products exist

### Images Not Loading
- Backend must be running
- Check if /uploads folder exists in backend
- Images use Unsplash URLs (requires internet)

### Orders Failing
- Check MongoDB connection in backend/.env
- Verify customer exists or create one first
- Check browser console for errors

## API Endpoints

### Products
- `GET /api/ecommerce/products/all` - Get all products
- `GET /api/ecommerce/products/:id` - Get single product

### Orders
- `POST /api/ecommerce/orders/create` - Create order
- `GET /api/ecommerce/orders/all` - Get all orders
- `PUT /api/ecommerce/orders/status/:id` - Update order status
- `PUT /api/ecommerce/orders/cancel/:id` - Cancel order

### Customers
- `POST /api/ecommerce/customers/create` - Create customer
- `GET /api/ecommerce/customers/all` - Get all customers
