const mongoose = require("mongoose");

const logisticsSchema = new mongoose.Schema(
  {
    supplier: { type: String, required: true },
    warehouse: { type: String, required: true },
    customer: { type: String, required: true },
    type: { type: String, enum: ["Inbound", "Outbound"], required: true },
    date: { type: String, required: true },
    status: { type: String, default: "Scheduled" },
    progress: { type: String, default: "Not started" },
    priority: { type: String, default: "Normal" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LogisticsRoute", logisticsSchema);
