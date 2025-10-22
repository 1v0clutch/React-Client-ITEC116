const axios = require("axios");
const FinanceInvoice = require("../models/FinanceInvoice"); // Create this model
const FinanceInventoryTransaction = require("../models/FinanceInventoryTransaction");

exports.recordInvoice = async (req, res) => {
  try {
    const { invoiceNumber, totalAmount, supplierId, dateIssued, purchaseOrderId, items, status } = req.body;
    // Save invoice data to Finance DB
    const financeInvoice = new FinanceInvoice({
      invoiceNumber,
      totalAmount,
      supplierId,
      dateIssued,
      purchaseOrderId,
      items,
      status
    });
    await financeInvoice.save();
    res.status(201).json({ message: 'Invoice recorded in Finance.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await FinanceInvoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleInventoryTransaction = async (req, res) => {
  try {
    const record = new FinanceInventoryTransaction(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryTransactions = async (req, res) => {
  try {
    const transactions = await FinanceInventoryTransaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayrollReport = async (req, res) => {
  try {
    const { data: payrolls } = await axios.get("http://localhost:8000/api/hr/payroll");
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Payroll = require("../models/payroll.model");

// 🧾 Payroll Report
exports.getPayrollReport = async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ dateProcessed: -1 });
    res.json(payrolls);
  } catch (err) {
    console.error("Error fetching payroll report:", err);
    res.status(500).json({ error: "Failed to fetch payroll report" });
  }
};

// controllers/finance.controller.js

exports.getSupplierReport = async (req, res) => {
  try {
    // ✅ Fetch directly from procurement Purchase Orders endpoint
    const { data: purchaseOrders } = await axios.get("http://localhost:8000/api/purchase-orders");

    // ✅ Format response for clarity
    const report = purchaseOrders.map(po => ({
      supplierName: po.supplierId?.name || "—",
      poNumber: po.poNumber,
      status: po.status || "—",
      totalAmount: po.totalAmount,
      date: po.createdAt,
    }));

    res.json(report);
  } catch (error) {
    console.error("Supplier Report error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
