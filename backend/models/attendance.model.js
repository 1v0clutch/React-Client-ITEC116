const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
<<<<<<< HEAD
  employee: { type: String, required: true },
  employeeId: { type: String }, // Add employee ID field
  date: { type: String, required: true },
  timeIn: { type: String, required: true },
  timeOut: { type: String, default: null },
});
=======
  employeeId: { type: String },      // optional internal id
  empId: { type: String, required: true }, // employee code used by frontend
  name: { type: String, required: true },
  timeIn: { type: Date, required: true },
  timeOut: { type: Date, default: null },
  overtime: { type: String, default: "0 hours" },
}, { timestamps: true });
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760

module.exports = mongoose.model("Attendance", AttendanceSchema);