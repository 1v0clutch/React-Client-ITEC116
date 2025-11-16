const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  location: String,
  zones: [{ zoneName: String, description: String }],
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    quantity: Number,
    zone: String
  }]
});

module.exports = mongoose.model("Warehouse", WarehouseSchema);
