const mongoose = require("mongoose");

const procurementSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  item: { type: String, required: true },
  rating: { type: Number, required: true },
  avgDelay: { type: Number, required: true },
  status: { type: String, default: "Available" },
});

module.exports = mongoose.model("Procurement", procurementSchema);
