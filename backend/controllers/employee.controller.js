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
  }
};

// Update employee
exports.update = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).send({ message: "Employee not found" });
    res.status(200).send(updated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
};

// Delete employee
exports.delete = async (req, res) => {
  try {
    const removed = await Employee.findByIdAndDelete(req.params.id);
    if (!removed)
      return res.status(404).send({ message: "Employee not found" });
    res.status(200).send({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
