const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");

//Create Invoice (Goods Receipt equivalent)
exports.createInvoice = async (req, res) => {
  try {
    const { poId, receivedItems, receivedBy, condition, notes } = req.body;

    // Generate unique invoice number (format: INV-YYYYMMDD-HHMMSS)
    const now = new Date();
    const invoiceNumber = `INV-${now.getFullYear()}${(now.getMonth()+1)
      .toString().padStart(2, '0')}${now.getDate()
      .toString().padStart(2, '0')}-${now.getHours()
      .toString().padStart(2, '0')}${now.getMinutes()
      .toString().padStart(2, '0')}${now.getSeconds()
      .toString().padStart(2, '0')}`;

    const newInvoice = new Invoice({
      poId,
      receivedItems,
      receivedBy,
      condition,
      notes,
      invoiceNumber, // <-- Add this line
    });

    await newInvoice.save();

    // Update PO status when invoice (receipt) is created
    await PurchaseOrder.findByIdAndUpdate(poId, { status: "delivered" });

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error("Create Invoice Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all Invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("poId", "poNumber totalAmount status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// elete Invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
