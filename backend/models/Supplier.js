const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: String,
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    paymentTerms: { type: String },
    rating: {
      delivery: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      price: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", SupplierSchema);
