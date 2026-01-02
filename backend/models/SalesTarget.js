const mongoose = require("mongoose");

const SalesTargetSchema = new mongoose.Schema(
  {
    product: { type: String, required: true },
    region: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesTarget", SalesTargetSchema);
