const Invoice = require("../models/Invoice");
const PurchaseOrder = require("../models/PurchaseOrder");
const Transaction = require("../models/Transaction");

exports.createInvoice = async (req, res) => {
  try {
    const { purchaseOrderId, supplierId, invoiceNumber, items, totalAmount } = req.body;
    if (!purchaseOrderId || !supplierId || !invoiceNumber || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "purchaseOrderId, supplierId, invoiceNumber and items[] are required" });
    }

    // save invoice first
    const invoice = new Invoice({
      purchaseOrderId,
      supplierId,
      invoiceNumber,
      items,
      totalAmount,
      status: "pending"
    });
    await invoice.save();

    // Perform a 3-way match (PO vs Invoice vs Stock Transactions)
    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      invoice.status = "mismatched";
      invoice.remarks = "PO not found";
      await invoice.save();
      return res.status(400).json({ invoice, match: "po_not_found" });
    }

    // Build quick lookup maps
    const poMap = new Map();
    for (const pItem of po.items) {
      poMap.set(String(pItem.itemId), (poMap.get(String(pItem.itemId)) || 0) + (pItem.quantity || 0));
    }

    const invMap = new Map();
    for (const iItem of items) {
      invMap.set(String(iItem.itemId), (invMap.get(String(iItem.itemId)) || 0) + (iItem.quantity || 0));
    }

    // Check PO vs Invoice item quantities
    const mismatches = [];
    for (const [itemId, invQty] of invMap.entries()) {
      const poQty = poMap.get(itemId) || 0;
      if (invQty > poQty) {
        mismatches.push({ itemId, reason: "Invoice quantity greater than PO quantity", poQty, invQty });
      }
    }

    // Check stock transactions (stock-in) tied to this PO
    for (const [itemId, invQty] of invMap.entries()) {
      // sum stock-in transactions for this PO & item
      const trxs = await Transaction.find({ purchaseOrderId: purchaseOrderId, itemId: itemId, type: "stock-in" });
      const receivedQty = trxs.reduce((s, t) => s + (t.quantity || 0), 0);
      if (receivedQty < invQty) {
        mismatches.push({ itemId, reason: "Received quantity less than invoiced", receivedQty, invQty });
      }
    }

    if (mismatches.length === 0) {
      invoice.status = "approved";
      await invoice.save();

      // optionally mark PO delivered if not already
      if (po.status !== "delivered") {
        po.status = "delivered";
        await po.save();
      }

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
    const invoices = await Invoice.find().populate("purchaseOrderId", "supplierId status");
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("purchaseOrderId");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};