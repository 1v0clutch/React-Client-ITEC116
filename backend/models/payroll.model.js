// backend/models/payroll.model.js
const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  department: String,
  payPeriod: String,
  grossPay: Number,
  deductions: Number,
  netPay: Number,
  dateProcessed: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payroll", PayrollSchema);
