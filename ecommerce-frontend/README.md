# E-Commerce Customer Portal (Module 6)

## 🛒 Overview
This is a **separate customer-facing e-commerce portal** that runs independently from the admin system.

## 🚀 Quick Start

### First Time Setup
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The portal will run on: **http://localhost:3000**

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│  Backend API (Port 8000)                    │
│  - Shared by Admin & E-Commerce             │
└─────────────────────────────────────────────┘
           ↓                    ↓
┌──────────────────┐  ┌──────────────────────┐
│ Admin System     │  │ E-Commerce Portal    │
│ Port 5173        │  │ Port 3000 (THIS)     │
│ Internal Use     │  │ Customer-Facing      │
└──────────────────┘  └──────────────────────┘
```

## 📋 Prerequisites

1. **Backend must be running:**
   ```bash
   cd ../backend
   npm run dev
   ```
   Backend runs on: http://localhost:8000

2. **MongoDB must be connected**

3. **Inventory items must exist** (created via Admin System)

## 🎯 Features

- **Product Catalog** - Browse available products
- **Shopping Cart** - Add/remove items, update quantities
- **Checkout** - Customer information and order placement
- **Order Tracking** - View order history and status

## 🔗 Navigation

| Page | URL | Description |
|------|-----|-------------|
| Shop | http://localhost:3000/ | Product catalog |
| Cart | http://localhost:3000/cart | Shopping cart |
| Checkout | http://localhost:3000/checkout | Place order |
| Orders | http://localhost:3000/orders | Order history |

## 🎨 UI Features

- Clean, customer-friendly interface
- Header with navigation and cart counter
- Toast notifications (no ugly alerts!)
- Responsive design
- Real-time stock validation

## 🔧 Configuration

### Port
Configured in `vite.config.js`:
```javascript
server: {
  port: 3000
}
```

### API Endpoint
All pages use:
```javascript
const API_BASE = "http://localhost:8000/api";
```

## 📦 Dependencies

- React 18
- React Router DOM
- Tailwind CSS
- Vite

## 🧪 Testing

### Test Complete Flow:
1. Visit http://localhost:3000
2. Browse products
3. Add items to cart
4. Go to cart
5. Proceed to checkout
6. Create customer and place order
7. View orders page

### Verify Integration:
1. Place order in E-Commerce (port 3000)
2. Check Admin System (port 5173)
3. Verify inventory decreased
4. Verify sales order created

## 🐛 Troubleshooting

### Port 3000 already in use?
```bash
# Kill process on port 3000
npx kill-port 3000
# Or change port in vite.config.js
```

### Can't connect to API?
- Verify backend is running on port 8000
- Check browser console for errors
- Test API: http://localhost:8000/api/ecommerce/products/all

### No products showing?
- Create inventory items in Admin System first
- Go to: http://localhost:5173/inventory/inventory-management

## 📁 Project Structure

```
ecommerce-frontend/
├── src/
│   ├── App.jsx              ← Main app with header/footer
│   ├── main.jsx             ← React entry point
│   ├── index.css            ← Global styles
│   ├── components/
│   │   └── Toast.jsx        ← Toast notifications
│   └── pages/
│       ├── ProductCatalog.jsx
│       ├── ShoppingCart.jsx
│       ├── Checkout.jsx
│       └── OrderManagement.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔐 Security Notes

- This is a customer-facing portal
- No admin features included
- Separate from internal admin system
- Can implement separate authentication

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Integration Points

### Module 1 (Inventory)
- **READ:** Product catalog
- **WRITE:** Stock deduction on order
- **WRITE:** Stock restoration on cancellation

### Module 8 (Sales)
- **WRITE:** Create sales order
- **WRITE:** Sync order status

## ✅ Success Indicators

- ✅ Runs on port 3000
- ✅ Shows product catalog
- ✅ Cart counter updates
- ✅ Can place orders
- ✅ Toast notifications work
- ✅ Orders sync with admin system

## 📞 Support

For issues:
1. Check backend is running (port 8000)
2. Check browser console for errors
3. Verify MongoDB connection
4. See `MODULE_6_SEPARATION_COMPLETE.md` for details

---

**Module 6 - E-Commerce Customer Portal**
Completely separate from Admin System
