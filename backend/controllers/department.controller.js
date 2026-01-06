const Department = require("../models/department.model");

// Get all departments
exports.getAll = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching departments",
      error: error.message
    });
  }
};

// Create new department
exports.create = async (req, res) => {
  try {
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: savedDepartment
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(400).json({
      success: false,
      message: "Error creating department",
      error: error.message
    });
  }
};

// Update department
exports.update = async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(400).json({
      success: false,
      message: "Error updating department",
      error: error.message
    });
  }
};

// Delete department
exports.delete = async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting department",
      error: error.message
    });
  }
};

// Get department by ID
exports.getById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching department",
      error: error.message
    });
  }
};