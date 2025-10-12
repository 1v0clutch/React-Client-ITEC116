const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const Transaction = require("../models/Transaction");
const { validateInvoice } = require("../utils/validation");
const axios = require('axios');

async function notifyFinance(invoiceData) {
  try {
    await axios.post('http://localhost:8000/api/finance/recordInvoice', invoiceData);
  } catch (err) {
    console.error('Failed to notify Finance:', err.message);
  }
}
async function testFinanceRecordInvoice() {
  const invoiceData = {
    invoiceNumber: 'INV-2024-001',
    totalAmount: 15000,
    supplierId: '664f...abc',
    dateIssued: new Date().toISOString(),
    purchaseOrderId: '664f...xyz',
    items: [{ itemId: '664f...itm', quantity: 10, unitPrice: 1500 }],
    status: 'approved'
  };

  try {
    const response = await fetch('http://localhost:8000/api/finance/recordInvoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData)
    });
    const result = await response.json();
    console.log(result);
    // Optionally show result in your UI
  } catch (error) {
    console.error('Error:', error);
  }
}
exports.createInvoice = async (req, res) => {
  try {
    // Validate input
    const { error } = validateInvoice(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { purchaseOrderId, supplierId, invoiceNumber, items, remarks } = req.body;

    // Auto-calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 0
    );

    // Save invoice initially as "pending"
    const invoice = new Invoice({
      purchaseOrderId,
      supplierId,
      invoiceNumber,
      items,
      totalAmount,
      status: "pending",
      remarks: remarks || ""
    });
    await invoice.save();

    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      invoice.status = "mismatched";
      invoice.remarks = "Purchase Order not found";
      await invoice.save();
      return res.status(400).json({ invoice, match: "po_not_found" });
    }

    // Build PO item lookup map
    const poMap = new Map();
    for (const pItem of po.items) {
      poMap.set(
        String(pItem.itemId),
        (poMap.get(String(pItem.itemId)) || 0) + (pItem.quantity || 0)
      );
    }

    // Build Invoice item lookup map
    const invMap = new Map();
    for (const iItem of items) {
      invMap.set(
        String(iItem.itemId),
        (invMap.get(String(iItem.itemId)) || 0) + (iItem.quantity || 0)
      );
    }

    // Track mismatches
    const mismatches = [];

    // Check PO vs Invoice
    for (const [itemId, invQty] of invMap.entries()) {
      const poQty = poMap.get(itemId) || 0;
      if (invQty > poQty) {
        mismatches.push({
          itemId,
          reason: "Invoice quantity greater than PO quantity",
          poQty,
          invQty
        });
      }
    }

    // Check Transactions vs Invoice (e.g., stock-in)
    for (const [itemId, invQty] of invMap.entries()) {
      const trxs = await Transaction.find({
        purchaseOrderId: purchaseOrderId,
        itemId: itemId,
        type: "stock-in"
      });

      const receivedQty = trxs.reduce((s, t) => s + (t.quantity || 0), 0);
      if (receivedQty < invQty) {
        mismatches.push({
          itemId,
          reason: "Received quantity less than invoiced",
          receivedQty,
          invQty
        });
      }
    }

    if (mismatches.length === 0) {
      invoice.status = "approved";
      await invoice.save();

      // Optionally update PO status if all matched
      if (po.status !== "delivered") {
        po.status = "delivered";
        await po.save();
      }

      // Notify Finance
      await notifyFinance({
        invoiceNumber,
        totalAmount,
        supplierId,
        dateIssued: new Date(),
        purchaseOrderId,
        items,
        status: "approved"
      });

      return res.status(201).json({ invoice, match: "matched" });
    } else {
      invoice.status = "mismatched";
      invoice.mismatchNotes = JSON.stringify(mismatches);
      await invoice.save();

      return res.status(200).json({ invoice, match: "mismatched", mismatches });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("purchaseOrderId", "status dateIssued")
      .populate("supplierId", "name contactInfo");
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("purchaseOrderId")
      .populate("supplierId", "name");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

