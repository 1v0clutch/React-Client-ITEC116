const express = require("express");
const router = express.Router();
const Salary = require("../models/salary.model");

// Get all salary records
router.get("/", async (req, res) => {
  try {
    const salaries = await Salary.find();
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add salary record
router.post("/", async (req, res) => {
  try {
    const salary = new Salary(req.body);
    await salary.save();
    res.json(salary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update salary record
router.put("/:id", async (req, res) => {
  try {
    const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete salary record
router.delete("/:id", async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ message: "Salary record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
