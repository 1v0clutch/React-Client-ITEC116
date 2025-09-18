const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactInfo: {
      phone: String,
      email: String,
      address: String,
    },
    productCatalog: [String], // optional: categories/items they supply
    rating: { type: Number, min: 1, max: 5 }, // performance rating
    contracts: String, // optional notes about contracts/terms
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);