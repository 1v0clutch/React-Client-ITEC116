require("dotenv").config();
const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");

const sampleProducts = [
  {
    name: "Wireless Mouse",
    sku: "MOUSE-001",
    description: "Ergonomic wireless mouse with 2.4GHz connectivity",
    category: "Electronics",
    quantity: 50,
    unit: "pcs",
    price: 599.99,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"
  },
  {
    name: "Mechanical Keyboard",
    sku: "KB-001",
    description: "RGB mechanical keyboard with blue switches",
    category: "Electronics",
    quantity: 30,
    unit: "pcs",
    price: 2499.99,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"
  },
  {
    name: "USB-C Cable",
    sku: "CABLE-001",
    description: "Fast charging USB-C cable 1.5m",
    category: "Accessories",
    quantity: 100,
    unit: "pcs",
    price: 199.99,
    imageUrl: "https://images.unsplash.com/photo-1591290619762-c588f0e8e23f?w=400"
  },
  {
    name: "Laptop Stand",
    sku: "STAND-001",
    description: "Adjustable aluminum laptop stand",
    category: "Accessories",
    quantity: 25,
    unit: "pcs",
    price: 899.99,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"
  },
  {
    name: "Webcam HD",
    sku: "CAM-001",
    description: "1080p HD webcam with built-in microphone",
    category: "Electronics",
    quantity: 15,
    unit: "pcs",
    price: 1899.99,
    imageUrl: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400"
  },
  {
    name: "Headphones",
    sku: "HP-001",
    description: "Noise-cancelling over-ear headphones",
    category: "Electronics",
    quantity: 40,
    unit: "pcs",
    price: 3499.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  {
    name: "Phone Case",
    sku: "CASE-001",
    description: "Protective silicone phone case",
    category: "Accessories",
    quantity: 8,
    unit: "pcs",
    price: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400"
  },
  {
    name: "Power Bank",
    sku: "PB-001",
    description: "20000mAh portable power bank",
    category: "Electronics",
    quantity: 0,
    unit: "pcs",
    price: 1299.99,
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400"
  },
  {
    name: "Monitor 24 inch",
    sku: "MON-001",
    description: "Full HD 24-inch LED monitor",
    category: "Electronics",
    quantity: 20,
    unit: "pcs",
    price: 8999.99,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"
  },
  {
    name: "Desk Lamp",
    sku: "LAMP-001",
    description: "LED desk lamp with adjustable brightness",
    category: "Office",
    quantity: 35,
    unit: "pcs",
    price: 799.99,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Inventory.deleteMany({});
    // console.log("🗑️  Cleared existing products");

    // Check if products already exist
    const existingCount = await Inventory.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing products. Skipping seed.`);
      console.log("   Delete products manually or uncomment deleteMany() to reseed.");
      process.exit(0);
    }

    // Insert sample products
    await Inventory.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${sampleProducts.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
