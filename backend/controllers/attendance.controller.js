const Attendance = require("../models/attendance.model");

// Get all attendance records
exports.getAll = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1, timeIn: -1 });
    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
      error: error.message
    });
  }
};

// Create new attendance record
exports.create = async (req, res) => {
  try {
    const record = new Attendance(req.body);
    const savedRecord = await record.save();
    res.status(201).json({
      success: true,
      message: "Attendance record created successfully",
      data: savedRecord
    });
  } catch (error) {
    console.error("Error creating attendance record:", error);
    res.status(400).json({
      success: false,
      message: "Error creating attendance record",
      error: error.message
    });
  }
};

// Update attendance record
exports.update = async (req, res) => {
<<<<<<< HEAD
  try {
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating attendance record:", error);
    res.status(400).json({
      success: false,
      message: "Error updating attendance record",
      error: error.message
    });
  }
};

// Get attendance by employee
exports.getByEmployee = async (req, res) => {
  try {
    const { employee } = req.params;
    const records = await Attendance.find({ employee }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: records.length,
      employee: employee,
      data: records
    });
  } catch (error) {
    console.error("Error fetching employee attendance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee attendance",
      error: error.message
    });
  }
};

// Delete attendance record
exports.delete = async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting attendance record",
      error: error.message
    });
  }
};
=======
  const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
