const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");
const Invoice = require("../models/Invoice");

exports.createSupplier = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Supplier name is required" });

    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Supplier not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Supplier not found" });
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// purchase history (POs + Invoices) for supplier
exports.getSupplierHistory = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });

    const orders = await PurchaseOrder.find({ supplierId }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ supplierId }).sort({ createdAt: -1 });

    res.json({ supplier, orders, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};