const Leave = require("../models/leave.model");

exports.getAll = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("leave.getAll:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    const leave = new Leave(payload);
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    console.error("leave.create:", err);
    res.status(400).json({ message: "Invalid payload" });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("leave.update:", err);
    res.status(400).json({ message: "Update failed" });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Leave.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Leave deleted successfully", deleted });
  } catch (err) {
    console.error("leave.delete:", err);
    res.status(400).json({ message: "Delete failed" });
  }
};