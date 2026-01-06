const Salary = require("../models/salary.model");

// Get all salary records
exports.getAll = async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ payDate: -1 });
    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    console.error("Error fetching salary records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching salary records",
      error: error.message
    });
  }
};

// Create new salary record
exports.create = async (req, res) => {
  try {
    const salary = new Salary(req.body);
    const savedSalary = await salary.save();
    res.status(201).json({
      success: true,
      message: "Salary record created successfully",
      data: savedSalary
    });
  } catch (error) {
    console.error("Error creating salary record:", error);
    res.status(400).json({
      success: false,
      message: "Error creating salary record",
      error: error.message
    });
  }
};

// Update salary record
exports.update = async (req, res) => {
  try {
    const updated = await Salary.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary record updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating salary record:", error);
    res.status(400).json({
      success: false,
      message: "Error updating salary record",
      error: error.message
    });
  }
};

// Delete salary record
exports.delete = async (req, res) => {
  try {
    const deleted = await Salary.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Salary record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary record deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting salary record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting salary record",
      error: error.message
    });
  }
};

// Get salary by employee
exports.getByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    const salaries = await Salary.find({ employee }).sort({ payDate: -1 });
    
    res.status(200).json({
      success: true,
      count: salaries.length,
      employee: employee,
      data: salaries
    });
  } catch (error) {
    console.error("Error fetching employee salary records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee salary records",
      error: error.message
    });
  }
};