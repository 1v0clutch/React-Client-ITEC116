const Requisition = require("../models/Requisition");

//Create new requisition
exports.createRequisition = async (req, res) => {
  try {
    const requisition = new Requisition(req.body);
    await requisition.save();
    res.status(201).json(requisition);
  } catch (err) {
    console.error("Create requisition error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Get all requisitions
exports.getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find().sort({ createdAt: -1 });
    // send plain array so frontend receives it directly
    res.json(requisitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Get single requisition by ID
exports.getRequisitionById = async (req, res) => {
  try {
    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ error: "Requisition not found" });
    res.json(requisition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Update requisition fields
exports.updateRequisition = async (req, res) => {
  try {
    const updated = await Requisition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Requisition not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Approve / Reject requisition
exports.updateStatus = async (req, res) => {
  try {
    const { status, approver, remarks } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ error: "Requisition not found" });

    requisition.status = status;
    requisition.approvalHistory.push({
      approver: approver || "System",
      status,
      remarks: remarks || "",
    });

    await requisition.save();
    res.json(requisition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Delete requisition
exports.deleteRequisition = async (req, res) => {
  try {
    const deleted = await Requisition.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Requisition not found" });
    res.json({ message: "Requisition deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
