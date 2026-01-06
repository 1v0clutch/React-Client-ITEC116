<<<<<<< HEAD
const Employee = require("../models/employee.model");

// Get all employees
exports.getAll = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ hireDate: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message
    });
  }
};

// Create new employee
exports.create = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: savedEmployee
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(400).json({
      success: false,
      message: "Error creating employee",
      error: error.message
    });
=======
const Employee = require("../models/Employee");

// Create employee
exports.create = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const saved = await employee.save();
    res.status(201).send(saved);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

// Get all employees
exports.findAll = async (req, res) => {
  try {
    const employees = await Employee.find().populate("allocations.project");
    res.status(200).send(employees);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get single employee
exports.findOne = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "allocations.project"
    );
    if (!employee)
      return res.status(404).send({ message: "Employee not found" });
    res.status(200).send(employee);
  } catch (err) {
    res.status(500).send({ message: err.message });
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
  }
};

// Update employee
exports.update = async (req, res) => {
  try {
<<<<<<< HEAD
    const updated = await Employee.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(400).json({
      success: false,
      message: "Error updating employee",
      error: error.message
    });
=======
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).send({ message: "Employee not found" });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send({ message: err.message });
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
  }
};

// Delete employee
exports.delete = async (req, res) => {
  try {
<<<<<<< HEAD
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting employee",
      error: error.message
    });
  }
};

// Get employee by ID
exports.getById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employee",
      error: error.message
    });
  }
};
=======
    const removed = await Employee.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).send({ message: "Employee not found" });
    res.status(200).send({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
