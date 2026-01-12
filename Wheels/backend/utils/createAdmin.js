const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User'); // 👈 FIXED PATH

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB");

    const existing = await User.findOne({ username: "admin" });

    if (existing) {
      console.log("⚠ Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("admin123", 10);

    const admin = new User({
      fullName: "System Administrator",
      username: "admin",
      passwordHash: hashed,
      role: "admin"
    });

    await admin.save();
    console.log("🎉 ADMIN ACCOUNT CREATED");
    console.log("USERNAME: admin");
    console.log("PASSWORD: admin123");

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit();
  }
}

createAdmin();
