const PurchaseOrder = require("../models/PurchaseOrder");
const Requisition = require("../models/Requisition");
const Supplier = require("../models/Supplier");
const axios = require("axios");

//Helper to auto-generate PO number
async function generatePONumber() {
  const lastPO = await PurchaseOrder.findOne({})
    .sort({ createdAt: -1 })
    .select("poNumber");
  let num = 1;
  if (lastPO && lastPO.poNumber) {
    const match = lastPO.poNumber.match(/PO-(\d+)/);
    if (match) num = parseInt(match[1], 10) + 1;
  }
  return `PO-${String(num).padStart(4, "0")}`;
}

//Create Purchase Order
exports.createPO = async (req, res) => {
  try {
    const { requisitionId, supplierId, items, expectedDelivery, notes } = req.body;

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const poNumber = await generatePONumber();

    const po = new PurchaseOrder({
      poNumber,
      requisitionId,
      supplierId,
      items,
      totalAmount,
      expectedDelivery,
      notes,
    });

    await po.save();
    res.status(201).json(po);
  } catch (err) {
    console.error("Create PO error:", err);
    res.status(500).json({ error: err.message });
  }
};

//Get all POs
exports.getPOs = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("requisitionId", "name department description")
      .populate("supplierId", "name email phone");
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Get single PO
exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("requisitionId")
      .populate("supplierId");
    if (!po) return res.status(404).json({ error: "PO not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Update PO
exports.updatePO = async (req, res) => {
  try {
    const updated = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "PO not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Delete PO
exports.deletePO = async (req, res) => {
  try {
    const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "PO not found" });
    res.json({ message: "PO deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

