const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
  employeeId: { type: String },
  empId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: "Pending" },
}, { timestamps: true });
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760

module.exports = mongoose.model("Leave", LeaveSchema);