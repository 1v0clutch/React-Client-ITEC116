const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }, // align with Module 1
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "paid"], default: "pending" },
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);