const Leave = require("../models/leave.model");

// Get all leave records
exports.getAll = async (req, res) => {
  try {
    const records = await Leave.find().sort({ appliedDate: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave records",
      error: error.message
    });
  }
};

// Create new leave application
exports.create = async (req, res) => {
  try {
    const record = new Leave(req.body);
    const savedRecord = await record.save();
    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: savedRecord
    });
  } catch (error) {
    console.error("Error creating leave application:", error);
    res.status(400).json({
      success: false,
      message: "Error creating leave application",
      error: error.message
    });
  }
};

// Update leave application
exports.update = async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating leave application:", error);
    res.status(400).json({
      success: false,
      message: "Error updating leave application",
      error: error.message
    });
  }
};

// Get leave by employee
exports.getByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    const records = await Leave.find({ employee }).sort({ appliedDate: -1 });
    
    res.status(200).json({
      success: true,
      count: records.length,
      employee: employee,
      data: records
    });
  } catch (error) {
    console.error("Error fetching employee leave records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee leave records",
      error: error.message
    });
  }
};

// Delete leave application
exports.delete = async (req, res) => {
  try {
    const deleted = await Leave.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting leave application:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting leave application",
      error: error.message
    });
  }
};