const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  employee: { type: String, required: true },
  date: { type: String, required: true },
  timeIn: { type: String, required: true },
  timeOut: { type: String, default: null },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);