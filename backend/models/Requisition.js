const mongoose = require("mongoose");

const RequisitionSchema = new mongoose.Schema(
  {
    requester: String, // later can link to User module
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" }, // link to Module 1
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