const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String },      // optional internal id
  empId: { type: String, required: true }, // employee code used by frontend
  name: { type: String, required: true },
  timeIn: { type: Date, required: true },
  timeOut: { type: Date, default: null },
  overtime: { type: String, default: "0 hours" },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);