// controllers/purchaseOrder.controller.js
const PurchaseOrder = require("../models/PurchaseOrder");
const Requisition = require("../models/Requisition");
const Supplier = require("../models/Supplier");
const { validatePurchaseOrder } = require("../utils/validation");

// Create a new Purchase Order
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { error, value } = validatePurchaseOrder(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Ensure requisition exists
    const requisition = await Requisition.findById(value.requisitionId);
    if (!requisition) {
      return res.status(404).json({ error: "Requisition not found" });
    }

    // Ensure supplier exists
    const supplier = await Supplier.findById(value.supplierId);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }

    // Save new PO
    const newPO = new PurchaseOrder(value);
    await newPO.save();

    // Refetch with populate
    const populatedPO = await PurchaseOrder.findById(newPO._id)
      .populate("requisitionId", "requester status")
      .populate("supplierId", "name contactInfo")
      .exec();

    return res
      .status(201)
      .json({ message: "Purchase Order created successfully", po: populatedPO });
  } catch (err) {
    console.error("❌ Error creating PO:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get all Purchase Orders
exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate("requisitionId", "requester status")
      .populate("supplierId", "name contactInfo");
    res.json(pos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a Purchase Order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("requisitionId", "requester status")
      .populate("supplierId", "name contactInfo");
    if (!po) return res.status(404).json({ error: "Purchase Order not found" });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Purchase Order status
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!po) return res.status(404).json({ error: "Purchase Order not found" });
    res.json({ message: "Purchase Order status updated", po });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Purchase Order
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Purchase Order not found" });
    res.json({ message: "Purchase Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
