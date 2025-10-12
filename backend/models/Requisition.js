const mongoose = require("mongoose");

const RequisitionSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true, // ✅ kailangan para alam kung kanino magre-request
    },

    items: [
      {
        itemId: { type: String, required: true }, // ✅ plain string (product name)
        quantity: { type: Number, required: true },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvalHistory: [
      {
        approver: String,
        status: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requisition", RequisitionSchema);
