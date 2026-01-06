const Payroll = require("../models/payroll.model");

// Get all payroll records
exports.getAll = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ dateProcessed: -1 });
    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error("Error fetching payroll records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payroll records",
      error: error.message
    });
  }
};

// Create new payroll record
exports.create = async (req, res) => {
  try {
    const payroll = new Payroll(req.body);
    const savedPayroll = await payroll.save();
    res.status(201).json({
      success: true,
      message: "Payroll record created successfully",
      data: savedPayroll
    });
  } catch (error) {
    console.error("Error creating payroll record:", error);
    res.status(400).json({
      success: false,
      message: "Error creating payroll record",
      error: error.message
    });
  }
};

// Update payroll record
exports.update = async (req, res) => {
  try {
    const updated = await Payroll.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll record updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating payroll record:", error);
    res.status(400).json({
      success: false,
      message: "Error updating payroll record",
      error: error.message
    });
  }
};

// Delete payroll record
exports.delete = async (req, res) => {
  try {
    const deleted = await Payroll.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payroll record deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting payroll record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting payroll record",
      error: error.message
    });
  }
};

// Get payroll by employee
exports.getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const payrolls = await Payroll.find({ employeeId }).sort({ dateProcessed: -1 });
    
    res.status(200).json({
      success: true,
      count: payrolls.length,
      employeeId: employeeId,
      data: payrolls
    });
  } catch (error) {
    console.error("Error fetching employee payroll records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee payroll records",
      error: error.message
    });
  }
};

// Get payroll by period
exports.getByPeriod = async (req, res) => {
  try {
    const { payPeriod } = req.params;
    const payrolls = await Payroll.find({ payPeriod }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: payrolls.length,
      payPeriod: payPeriod,
      data: payrolls
    });
  } catch (error) {
    console.error("Error fetching payroll by period:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payroll by period",
      error: error.message
    });
  }
};