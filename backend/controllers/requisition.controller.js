const Requisition = require("../models/Requisition");
const PurchaseOrder = require("../models/PurchaseOrder");

exports.createRequisition = async (req, res) => {
  try {
    const { requester, items } = req.body;
    if (!requester || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "requester and items[] are required" });
    }

    const reqDoc = new Requisition(req.body);
    await reqDoc.save();
    res.status(201).json(reqDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequisitions = async (req, res) => {
  try {
    const requisitions = await Requisition.find().sort({ createdAt: -1 });
    res.json(requisitions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequisitionById = async (req, res) => {
  try {
    const r = await Requisition.findById(req.params.id).populate("items.itemId", "name sku");
    if (!r) return res.status(404).json({ error: "Requisition not found" });
    res.json(r);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// approve/reject requisition; body: { status: "approved"|"rejected", approver: "Name" }
exports.updateRequisitionStatus = async (req, res) => {
  try {
    const { status, approver } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ error: "Requisition not found" });

    requisition.status = status;
    requisition.approvalHistory = requisition.approvalHistory || [];
    requisition.approvalHistory.push({ approver: approver || "system", status, date: new Date() });
    await requisition.save();

    res.json(requisition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// optional: create PO from requisition
exports.createPOFromRequisition = async (req, res) => {
  try {
    const { supplierId } = req.body; // supplier must be provided
    const requisition = await Requisition.findById(req.params.id);
    if (!requisition) return res.status(404).json({ error: "Requisition not found" });
    if (requisition.status !== "approved") {
      return res.status(400).json({ error: "Requisition must be approved before creating PO" });
    }

    if (!supplierId) return res.status(400).json({ error: "supplierId is required to create PO" });

    const poItems = requisition.items.map(i => ({
      itemId: i.itemId,
      quantity: i.quantity,
      price: 0, // price to be set by procurement / supplier negotiation
    }));

    const po = new PurchaseOrder({
      requisitionId: requisition._id,
      supplierId,
      items: poItems,
      status: "draft"
    });

    await po.save();
    res.status(201).json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};