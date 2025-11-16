const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // item name
  sku: { type: String, unique: true },    // stock keeping unit
  description: String,
  category: String,
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: "pcs" }, // type of unit (pcs)
  updatedAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Inventory", InventorySchema);