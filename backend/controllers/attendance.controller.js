const Attendance = require("../models/attendance.model");

exports.getAll = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: 1 });
    res.json(records);
  } catch (err) {
    console.error("attendance.getAll:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body;
    // ensure timeIn is Date
    if (payload.timeIn) payload.timeIn = new Date(payload.timeIn);
    if (payload.timeOut) payload.timeOut = new Date(payload.timeOut);

    const rec = new Attendance(payload);
    await rec.save();
    res.status(201).json(rec);
  } catch (err) {
    console.error("attendance.create:", err);
    res.status(400).json({ message: "Invalid payload" });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.timeIn) updates.timeIn = new Date(updates.timeIn);
    if (updates.timeOut) updates.timeOut = new Date(updates.timeOut);

    const updated = await Attendance.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error("attendance.update:", err);
    res.status(400).json({ message: "Update failed" });
  }
};