const express = require("express");
const router = express.Router();
const Payroll = require("../models/payroll.model");

// Get all payroll records
router.get("/", async (req, res) => {
  try {
    const payrolls = await Payroll.find();
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add payroll record
router.post("/", async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    await payroll.save();
    res.json(payroll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update payroll record
router.put("/:id", async (req, res) => {
  try {
    const updated = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete payroll record
router.delete("/:id", async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: "Payroll record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
