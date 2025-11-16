const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
  type: { type: String, enum: ["stock-in", "stock-out"], required: true },
  quantity: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  remarks: String,
  expiryDate: Date,

  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder", // Comes from Module 3
    default: null,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
