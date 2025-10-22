const express = require("express");
const router = express.Router();
const Payroll = require("../models/payroll.model");

// Get all payroll records
router.get("/payroll", async (req, res) => {
  try {
    const records = await Payroll.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new payroll record (from HR module)
router.post("/payroll", async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    await payroll.save();
    res.status(201).json(payroll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
