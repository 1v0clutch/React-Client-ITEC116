const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  employeeId: { type: String }, // Add employee ID field
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  appliedDate: { type: Date, default: Date.now },
  reviewedBy: { type: String, default: null },
  reviewedDate: { type: Date, default: null }
});

module.exports = mongoose.model("Leave", LeaveSchema);