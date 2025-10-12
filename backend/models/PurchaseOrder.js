const mongoose = require("mongoose");

const PurchaseOrderSchema = new mongoose.Schema(
  {
    requisitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Requisition" },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [
      {
        itemId: { type: String, required: true }, // product name string from supplier
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "sent", "confirmed", "delivered", "cancelled"],
      default: "draft",
    },
    dateIssued: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", PurchaseOrderSchema);