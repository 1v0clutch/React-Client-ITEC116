const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  hireDate: { type: String, required: true },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
