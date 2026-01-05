const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CRMCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    preference: { type: String, default: "" },
    history: { type: String, default: "" },
    segment: { type: String, enum: ["Regular", "VIP"], default: "Regular" },
    logs: [LogSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CRMCustomer", CRMCustomerSchema);
