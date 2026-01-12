const express = require("express");
const router = express.Router();
const Department = require("../models/department.model");

// Get all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Failed to fetch departments", error: err.message });
  }
});

// Get single department by ID
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ message: "Failed to fetch department", error: err.message });
  }
});

// Add new department
router.post("/", async (req, res) => {
  try {
    const { name, head, description } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // Check if department with same name already exists
    const existingDept = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } // Case-insensitive check
    });
    
    if (existingDept) {
      return res.status(400).json({ message: "A department with this name already exists" });
    }

    const department = new Department({
      name: name.trim(),
      head: head ? head.trim() : "",
      description: description ? description.trim() : ""
    });
    
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    console.error("Error creating department:", err);
    if (err.code === 11000) {
      // Duplicate key error
      res.status(400).json({ message: "A department with this name already exists" });
    } else {
      res.status(400).json({ message: "Failed to create department", error: err.message });
    }
  }
});

// Update department
router.put("/:id", async (req, res) => {
  try {
    const { name, head, description } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // Check if another department with same name already exists (excluding current one)
    const existingDept = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    
    if (existingDept) {
      return res.status(400).json({ message: "A department with this name already exists" });
    }

    const updated = await Department.findByIdAndUpdate(
      req.params.id, 
      {
        name: name.trim(),
        head: head ? head.trim() : "",
        description: description ? description.trim() : ""
      }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating department:", err);
    if (err.code === 11000) {
      res.status(400).json({ message: "A department with this name already exists" });
    } else {
      res.status(400).json({ message: "Failed to update department", error: err.message });
    }
  }
});

// Delete department
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json({ message: "Department deleted successfully", department: deleted });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ message: "Failed to delete department", error: err.message });
  }
});

module.exports = router;
