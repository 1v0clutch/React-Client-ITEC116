const Attendance = require("../models/attendance.model");

exports.getAll = async (req, res) => {
  const records = await Attendance.find();
  res.json(records);
};

exports.create = async (req, res) => {
  const record = new Attendance(req.body);
  await record.save();
  res.json(record);
};

exports.update = async (req, res) => {
  const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};