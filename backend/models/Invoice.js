const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    poId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },
    receivedItems: [
      {
        description: String,
        quantityReceived: Number,
        remarks: String,
      },
    ],
    receivedBy: { type: String, required: true },
    dateReceived: { type: Date, default: Date.now },
    condition: {
      type: String,
      enum: ["Good", "Damaged", "Partial"],
      default: "Good",
    },
    notes: String,
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
