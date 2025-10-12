const FinanceInvoice = require("../models/FinanceInvoice"); // Create this model
const FinanceInventoryTransaction = require("../models/FinanceInventoryTransaction"); // Create this model

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