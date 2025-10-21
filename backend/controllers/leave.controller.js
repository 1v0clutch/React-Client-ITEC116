const Leave = require("../models/leave.model");

exports.getAll = async (req, res) => {
  const leaves = await Leave.find();
  res.json(leaves);
};

exports.create = async (req, res) => {
  const leave = new Leave(req.body);
  await leave.save();
  res.json(leave);
};