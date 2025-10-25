const express = require("express");
const router = express.Router();
const Department = require("../models/department.model");

// Get all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new department
router.post("/", async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update department
router.put("/:id", async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete department
router.delete("/:id", async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
