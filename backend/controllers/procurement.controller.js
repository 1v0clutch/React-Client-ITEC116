const Procurement = require("../models/procurement.model");

// CREATE procurement order
exports.createProcurement = async (req, res) => {
  try {
    const newOrder = new Procurement(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ all procurements
exports.getProcurements = async (req, res) => {
  try {
    const data = await Procurement.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ one by ID
exports.getProcurementById = async (req, res) => {
  try {
    const data = await Procurement.findById(req.params.id);
    if (!data) return res.status(404).json({ error: "Procurement not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE procurement
exports.updateProcurement = async (req, res) => {
  try {
    const updated = await Procurement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Procurement not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE procurement
exports.deleteProcurement = async (req, res) => {
  try {
    const deleted = await Procurement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Procurement not found" });
    res.json({ message: "Procurement deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
