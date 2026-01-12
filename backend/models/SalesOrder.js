const mongoose = require("mongoose");

const SalesOrderSchema = new mongoose.Schema(
  {
    customerId: { type: Number, required: true },
    customerName: { type: String, default: "" },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      default: null,
    },
    onlineOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnlineOrder",
      default: null,
    },
    orderSource: {
      type: String,
      enum: ["manual", "ecommerce", "quotation"],
      default: "manual",
    },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    tax: { type: Number, default: 12, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["pending", "processed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    invoiceStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesOrder", SalesOrderSchema);
