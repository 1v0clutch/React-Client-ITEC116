const axios = require("axios");
const FinanceInvoice = require("../models/FinanceInvoice"); // Create this model
const FinanceInventoryTransaction = require("../models/FinanceInventoryTransaction");
const Inventory = require("../models/Inventory");
const Transaction = require("../models/Transaction");

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
    const payload = req.body || {};

    const extractId = (value) => {
      if (!value) return null;
      if (typeof value === "string") return value;
      if (value._id) return String(value._id);
      return null;
    };

    const rawItemId = payload.itemId || payload.item?.id || payload.itemId?._id;
    const itemId = extractId(rawItemId);
    if (!itemId) {
      return res.status(400).json({ error: "Missing inventory item reference" });
    }

    const quantityRaw = payload.quantity ?? payload.qty ?? payload.count;
    const quantityValue = Number(quantityRaw);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    let type = payload.type || payload.transactionType || payload.category || payload.movementType || payload.eventType || payload.operation || "";
    if (!type) {
      return res.status(400).json({ error: "Missing transaction type" });
    }

    let itemName = payload.item || payload.itemName || payload.name || "";
    let itemSku = payload.itemSku || payload.sku || "";

    if (!itemName || !itemSku) {
      const inventoryItem = await Inventory.findById(itemId).select("name sku").lean();
      if (inventoryItem) {
        if (!itemName) itemName = inventoryItem.name || "";
        if (!itemSku) itemSku = inventoryItem.sku || "";
      }
    }

    const record = new FinanceInventoryTransaction({
      transactionId: payload.transactionId ? String(payload.transactionId) : null,
      itemId,
      itemSku: itemSku || "",
      item: itemName || "—",
      type,
      quantity: quantityValue,
      remarks: payload.remarks || payload.notes || "",
      purchaseOrderId: extractId(payload.purchaseOrderId) || payload.purchaseOrderNumber || payload.poNumber || "",
      date:
        payload.date || payload.transactionDate || payload.createdAt
          ? new Date(payload.date || payload.transactionDate || payload.createdAt)
          : new Date(),
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryTransactions = async (req, res) => {
  try {
    const financeTransactions = await FinanceInventoryTransaction.find().lean();
    const transactionIds = financeTransactions
      .map((entry) => entry.transactionId)
      .filter((value) => Boolean(value));

    const missingItemIds = Array.from(
      new Set(
        financeTransactions
          .filter((entry) => !entry.transactionId && entry.itemId)
          .map((entry) => entry.itemId.toString())
      )
    );

    const [inventoryItems, sourceTransactions, fallbackTransactions] = await Promise.all([
      Inventory.find().select("name sku").lean().catch(() => []),
      transactionIds.length
        ? Transaction.find({ _id: { $in: transactionIds } })
            .populate("itemId", "name sku")
            .populate("purchaseOrderId", "poNumber status orderDate referenceNumber")
            .lean()
            .catch(() => [])
        : Promise.resolve([]),
      missingItemIds.length
        ? Transaction.find({ itemId: { $in: missingItemIds } })
            .populate("itemId", "name sku")
            .populate("purchaseOrderId", "poNumber status orderDate referenceNumber")
            .lean()
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    const itemMap = Array.isArray(inventoryItems)
      ? inventoryItems.reduce((acc, item) => {
          acc[item._id.toString()] = item;
          return acc;
        }, {})
      : {};

    const transactionMap = Array.isArray(sourceTransactions)
      ? sourceTransactions.reduce((acc, entry) => {
          acc[entry._id.toString()] = entry;
          return acc;
        }, {})
      : {};

    const fallbackTransactionMap = Array.isArray(fallbackTransactions)
      ? fallbackTransactions.reduce((acc, entry) => {
          const key = entry.itemId?._id ? entry.itemId._id.toString() : entry.itemId?.toString();
          if (!key) return acc;
          const existing = acc[key];
          if (!existing || new Date(entry.transactionDate || 0) > new Date(existing.transactionDate || 0)) {
            acc[key] = entry;
          }
          return acc;
        }, {})
      : {};

    const normalized = financeTransactions.map((tx) => {
      const itemIdKey = tx.itemId ? tx.itemId.toString() : "";
      const itemSource = itemMap[itemIdKey] || {};
      const linkedTransaction = tx.transactionId ? transactionMap[tx.transactionId] : undefined;
      const fallbackTransaction = linkedTransaction ? undefined : fallbackTransactionMap[itemIdKey];
      const transactionItem = linkedTransaction?.itemId || fallbackTransaction?.itemId;
      const transactionPurchaseOrder = linkedTransaction?.purchaseOrderId || fallbackTransaction?.purchaseOrderId;

      const baseItem =
        (tx.item && tx.item !== "—" && tx.item) ||
        tx.itemName ||
        tx.name ||
        transactionItem?.name ||
        itemSource.name ||
        "—";
      const skuValue = transactionItem?.sku || itemSource.sku;
      const itemWithSku = baseItem !== "—" && skuValue ? `${baseItem} (${skuValue})` : baseItem;
      const typeValue =
        tx.type ||
        tx.transactionType ||
        tx.category ||
        tx.movementType ||
        tx.eventType ||
        tx.operation ||
        linkedTransaction?.type ||
        fallbackTransaction?.type ||
        fallbackTransaction?.transactionType ||
        "—";
      const quantityRaw =
        typeof tx.quantity === "number"
          ? tx.quantity
          : Number(
              tx.quantity ??
                tx.qty ??
                tx.count ??
                linkedTransaction?.quantity ??
                fallbackTransaction?.quantity
            );
      const remarksValue =
        tx.remarks ||
        tx.notes ||
        linkedTransaction?.remarks ||
        fallbackTransaction?.remarks ||
        "";
      const fallbackPurchaseOrder = fallbackTransaction?.purchaseOrderId;
      const purchaseOrderValue =
        tx.purchaseOrderId ||
        tx.purchaseOrder ||
        tx.reference ||
        (transactionPurchaseOrder?.poNumber || transactionPurchaseOrder?._id) ||
        (typeof fallbackPurchaseOrder === "object"
          ? fallbackPurchaseOrder?.poNumber || fallbackPurchaseOrder?._id
          : fallbackPurchaseOrder) ||
        "";
      const dateValue =
        tx.date ||
        tx.transactionDate ||
        tx.createdAt ||
        tx.updatedAt ||
        linkedTransaction?.transactionDate ||
        fallbackTransaction?.transactionDate ||
        null;

      return {
        ...tx,
        item: itemWithSku,
        type: typeValue,
        quantity: Number.isFinite(quantityRaw) ? quantityRaw : 0,
        remarks: remarksValue,
        purchaseOrderId: purchaseOrderValue,
        date: dateValue,
      };
    });

    res.json(normalized);
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
