const mongoose = require("mongoose");

const SalarySchema = new mongoose.Schema({
  employee: { type: String, required: true },
  basePay: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  payDate: { type: String, required: true },
});

module.exports = mongoose.model("Salary", SalarySchema);
