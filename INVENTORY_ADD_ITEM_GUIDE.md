# How to Add Items to Inventory - Complete Guide

## 📋 Required Fields

When adding a new item to inventory, you **MUST** fill in these fields:

### 1. **Item Name** ✅ REQUIRED
- **What to enter:** The product name
- **Rules:** 
  - Minimum 2 characters
  - Maximum 100 characters
- **Examples:**
  - ✅ "Laptop Dell XPS 15"
  - ✅ "Office Chair"
  - ✅ "USB Cable"
  - ❌ "A" (too short)

### 2. **SKU** ✅ REQUIRED
- **What to enter:** Stock Keeping Unit (unique product code)
- **Rules:**
  - Minimum 3 characters
  - Maximum 20 characters
  - Only letters, numbers, hyphens (-), and underscores (_)
  - Must be unique (no duplicates)
- **Examples:**
  - ✅ "LAP-001"
  - ✅ "CHAIR_OFFICE_01"
  - ✅ "USB-C-CABLE-2M"
  - ❌ "AB" (too short)
  - ❌ "LAP 001" (spaces not allowed)
  - ❌ "LAP@001" (special characters not allowed)

### 3. **Category** ✅ REQUIRED
- **What to enter:** Product category
- **Rules:** Any text
- **Examples:**
  - ✅ "Electronics"
  - ✅ "Furniture"
  - ✅ "Office Supplies"
  - ✅ "Accessories"

### 4. **Quantity** ✅ REQUIRED
- **What to enter:** Number of items in stock
- **Rules:**
  - Must be a whole number
  - Minimum 0
- **Examples:**
  - ✅ 0 (out of stock)
  - ✅ 10
  - ✅ 100
  - ❌ -5 (negative not allowed)
  - ❌ 10.5 (decimals not allowed)

---

## 📋 Optional Fields

These fields are optional but recommended for e-commerce:

### 5. **Price** (Optional but recommended for e-commerce)
- **What to enter:** Product price in dollars
- **Rules:**
  - Must be 0 or positive
  - Can have decimals
- **Examples:**
  - ✅ 0 (free item)
  - ✅ 9.99
  - ✅ 1299.00
  - ❌ -10 (negative not allowed)

### 6. **Product Image** (Optional but recommended for e-commerce)
- **What to enter:** Upload an image file
- **Rules:**
  - Supported formats: JPG, PNG, GIF, WebP
  - Maximum file size: 5MB
- **How to upload:**
  1. Click "Choose File" button
  2. Select image from your computer
  3. Wait for upload to complete
  4. Preview will appear

### 7. **Description** (Optional)
- **What to enter:** Detailed product description
- **Rules:** Any text
- **Examples:**
  - "High-performance laptop with 16GB RAM and 512GB SSD"
  - "Ergonomic office chair with lumbar support"

---

## 🎯 Step-by-Step: Adding Your First Item

### Example: Adding a Laptop

1. **Click "Add Item" button** (green button at top right)

2. **Fill in the form:**
   ```
   Item Name: Dell XPS 15 Laptop
   SKU: LAP-DELL-XPS15
   Category: Electronics
   Quantity: 25
   Price: 1299.99
   Description: High-performance laptop with Intel i7, 16GB RAM, 512GB SSD
   ```

3. **Upload Image (Optional):**
   - Click "Choose File"
   - Select laptop image
   - Wait for upload

4. **Click "Add Item"**

5. **Success!** You should see:
   - Green success message
   - Item appears in the list
   - Item is now available in e-commerce store

---

## ❌ Common Errors and Solutions

### Error: "SKU must be at least 3 characters"
**Solution:** Make your SKU longer
- ❌ "AB"
- ✅ "ABC" or "LAP-01"

### Error: "SKU must match pattern"
**Solution:** Remove spaces and special characters (except - and _)
- ❌ "LAP 001"
- ❌ "LAP@001"
- ✅ "LAP-001"
- ✅ "LAP_001"

### Error: "SKU already exists"
**Solution:** Each SKU must be unique. Try:
- ❌ "LAP-001" (if already exists)
- ✅ "LAP-002"
- ✅ "LAP-001-V2"

### Error: "Name is required"
**Solution:** Fill in the Item Name field
- ❌ (empty)
- ✅ "Laptop"

### Error: "Category is required"
**Solution:** Fill in the Category field
- ❌ (empty)
- ✅ "Electronics"

### Error: "Quantity must be a positive number"
**Solution:** Enter 0 or higher
- ❌ -5
- ✅ 0
- ✅ 10

---

## 📝 Quick Reference: Sample Products

### Sample 1: Electronics
```
Item Name: Wireless Mouse
SKU: MOUSE-WIRELESS-01
Category: Electronics
Quantity: 50
Price: 29.99
Description: Ergonomic wireless mouse with USB receiver
```

### Sample 2: Furniture
```
Item Name: Office Desk
SKU: DESK-OFFICE-WOOD
Category: Furniture
Quantity: 15
Price: 299.99
Description: Solid wood office desk, 60x30 inches
```

### Sample 3: Office Supplies
```
Item Name: Printer Paper A4
SKU: PAPER-A4-500
Category: Office Supplies
Quantity: 200
Price: 8.99
Description: 500 sheets of premium A4 printer paper
```

### Sample 4: Accessories
```
Item Name: USB-C Cable 2M
SKU: CABLE-USBC-2M
Category: Accessories
Quantity: 100
Price: 12.99
Description: High-speed USB-C charging cable, 2 meters
```

---

## 🔧 Troubleshooting

### "I can't click Add Item button"
**Check:**
1. Is the backend server running? (`npm run dev` in backend folder)
2. Is the frontend running? (`npm run dev` in frontend folder)
3. Check browser console for errors (F12)

### "Form won't submit"
**Check:**
1. All required fields filled? (Name, SKU, Category, Quantity)
2. SKU format correct? (only letters, numbers, -, _)
3. Quantity is a whole number?
4. No duplicate SKU?

### "Image won't upload"
**Check:**
1. File size under 5MB?
2. File format is JPG, PNG, GIF, or WebP?
3. Backend server running?
4. Check uploads folder exists: `backend/uploads/`

---

## 🎨 For E-Commerce Display

To make your products look good in the e-commerce store:

### Essential:
- ✅ Add a **Price** (customers need to know the cost!)
- ✅ Upload a **Product Image** (visual appeal)
- ✅ Write a good **Description** (helps customers decide)

### Tips:
- Use clear, descriptive names
- Use consistent SKU format (e.g., all start with category code)
- Keep categories consistent (don't mix "Electronics" and "Electronic")
- Set realistic quantities
- Use high-quality product images

---

## 📊 After Adding Items

Your items will automatically:
- ✅ Appear in Admin Inventory list
- ✅ Show up in E-Commerce Product Catalog
- ✅ Be available for customers to purchase
- ✅ Have real-time stock tracking
- ✅ Integrate with Sales Orders (Module 8)

---

## 🚀 Quick Start Checklist

- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend running (`cd frontend && npm run dev`)
- [ ] Click "Add Item" button
- [ ] Fill in: Name, SKU, Category, Quantity
- [ ] (Optional) Add Price for e-commerce
- [ ] (Optional) Upload product image
- [ ] (Optional) Add description
- [ ] Click "Add Item" to save
- [ ] Check item appears in list
- [ ] Verify item shows in e-commerce store

---

## 💡 Pro Tips

1. **Use a naming convention for SKUs:**
   - Electronics: `ELEC-XXX`
   - Furniture: `FURN-XXX`
   - Supplies: `SUPP-XXX`

2. **Keep categories simple:**
   - Use 5-10 main categories
   - Be consistent with naming

3. **Set initial stock carefully:**
   - Start with realistic quantities
   - You can always adjust later

4. **Add prices from the start:**
   - Even if approximate
   - Makes e-commerce ready immediately

5. **Upload images in batches:**
   - Prepare images beforehand
   - Use consistent image sizes
   - Compress large images before upload

---

**Need Help?** Check the error message carefully - it usually tells you exactly what's wrong!

**Still stuck?** Make sure all required fields are filled and SKU follows the rules (letters, numbers, -, _ only).
