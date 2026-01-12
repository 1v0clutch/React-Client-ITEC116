const mongoose = require("mongoose");

const RequisitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    contact: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d+$/.test(v);
        },
        message: "Contact must contain only digits",
      },
    },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    purpose: { type: String, required: true },
    budgetCode: { type: String, required: true },
    date: { type: String },
    deliveryDate: { type: String, required: true },
    deliveryLocation: { type: String, required: true },

    // Approval flow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvalHistory: [
      {
        approver: String,
        status: String,
        remarks: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requisition", RequisitionSchema);
