const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

module.exports = mongoose.model("Leave", LeaveSchema);