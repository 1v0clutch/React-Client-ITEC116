const mongoose = require("mongoose");

const SupportCaseSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },
    issue: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in progress", "resolved"],
      default: "open",
    },
    assignedTo: { type: String, required: true },
    satisfaction: { type: Number, min: 1, max: 5, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportCase", SupportCaseSchema);
