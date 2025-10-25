const mongoose = require("mongoose");
const axios = require("axios");
const FinanceInvoice = require("../models/FinanceInvoice");
const FinanceInventoryTransaction = require("../models/FinanceInventoryTransaction");
const Inventory = require("../models/Inventory");
const Transaction = require("../models/Transaction");
const Supplier = require("../models/Supplier");
const PurchaseOrder = require("../models/PurchaseOrder");

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : NaN;
  }
  return NaN;
};

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

exports.getCustomerReport = async (req, res) => {
  try {
    const invoices = await FinanceInvoice.find().lean();
    if (!invoices.length) {
      return res.json([]);
    }

    const supplierIdStrings = [];
    const purchaseOrderIdStrings = [];

    for (const invoice of invoices) {
      if (invoice.supplierId) {
        supplierIdStrings.push(invoice.supplierId.toString());
      }
      if (invoice.purchaseOrderId) {
        purchaseOrderIdStrings.push(invoice.purchaseOrderId.toString());
      }
    }

    const uniqueSupplierIds = [...new Set(supplierIdStrings.filter((id) => mongoose.Types.ObjectId.isValid(id)))];
    const uniquePurchaseOrderIds = [...new Set(purchaseOrderIdStrings.filter((id) => mongoose.Types.ObjectId.isValid(id)))];

    const [suppliers, purchaseOrders] = await Promise.all([
      uniqueSupplierIds.length
        ? Supplier.find({ _id: { $in: uniqueSupplierIds } }).select("name contactPerson").lean()
        : [],
      uniquePurchaseOrderIds.length
        ? PurchaseOrder.find({ _id: { $in: uniquePurchaseOrderIds } }).select("poNumber totalAmount status createdAt").lean()
        : [],
    ]);

    const supplierMap = suppliers.reduce((acc, supplier) => {
      acc[supplier._id.toString()] = supplier;
      return acc;
    }, {});

    const purchaseOrderMap = purchaseOrders.reduce((acc, po) => {
      acc[po._id.toString()] = po;
      return acc;
    }, {});

    const report = invoices.map((invoice) => {
      const supplierKey = invoice.supplierId ? invoice.supplierId.toString() : null;
      const purchaseOrderKey = invoice.purchaseOrderId ? invoice.purchaseOrderId.toString() : null;
      const supplier = supplierKey ? supplierMap[supplierKey] : undefined;
      const purchaseOrder = purchaseOrderKey ? purchaseOrderMap[purchaseOrderKey] : undefined;

      const totalFromInvoice = toNumber(invoice.totalAmount);
      const totalFromPurchaseOrder = toNumber(purchaseOrder?.totalAmount);
      const totalAmount = Number.isFinite(totalFromInvoice) ? totalFromInvoice : Number.isFinite(totalFromPurchaseOrder) ? totalFromPurchaseOrder : 0;

      const balanceCandidates = [invoice.balance, invoice.amountDue, invoice.remainingBalance, invoice.totalAmount, purchaseOrder?.totalAmount];
      let balance = 0;
      for (const candidate of balanceCandidates) {
        const numeric = toNumber(candidate);
        if (Number.isFinite(numeric)) {
          balance = numeric;
          break;
        }
      }
      if (!Number.isFinite(balance) || balance <= 0) {
        balance = totalAmount;
      }

      const dateCandidates = [invoice.dateIssued, purchaseOrder?.createdAt, invoice.createdAt, invoice.updatedAt];
      let resolvedDate = null;
      for (const candidate of dateCandidates) {
        if (candidate) {
          resolvedDate = candidate;
          break;
        }
      }

      return {
        id: invoice._id.toString(),
        customerName: invoice.customerName || invoice.customer || supplier?.name || supplierKey || "—",
        customerId: supplier ? { name: supplier.name } : undefined,
        invoiceNumber: invoice.invoiceNumber || purchaseOrder?.poNumber || "—",
        status: invoice.status || purchaseOrder?.status || "Pending",
        totalAmount,
        total: totalAmount,
        grandTotal: totalAmount,
        balance,
        amountDue: balance,
        remainingBalance: balance,
        date: resolvedDate,
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer report" });
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
    const [transactions, inventoryItems, sourceTransactions] = await Promise.all([
      FinanceInventoryTransaction.find().lean(),
      Inventory.find().select("name sku").lean().catch(() => []),
      Transaction.find().select("itemId type quantity remarks transactionDate purchaseOrderId").lean().catch(() => []),
    ]);

    const itemMap = Array.isArray(inventoryItems)
      ? inventoryItems.reduce((acc, item) => {
          acc[item._id.toString()] = item;
          return acc;
        }, {})
      : {};

    const transactionLookup = Array.isArray(sourceTransactions)
      ? sourceTransactions.reduce((acc, entry) => {
          acc[entry._id.toString()] = entry;
          if (entry.itemId) {
            const key = entry.itemId.toString();
            if (!acc[key]) acc[key] = entry;
          }
          return acc;
        }, {})
      : {};

    const normalized = transactions.map((tx) => {
      const itemIdKey = tx.itemId ? tx.itemId.toString() : "";
      const itemSource = itemMap[itemIdKey] || {};
      const linked = tx.transactionId ? transactionLookup[tx.transactionId] : undefined;
      const fallback = !linked && itemIdKey ? transactionLookup[itemIdKey] : undefined;

      const transactionItemId = linked?.itemId || fallback?.itemId;
      const transactionItem = transactionItemId ? itemMap[transactionItemId.toString()] : undefined;

      const baseItem =
        (tx.item && tx.item !== "—" && tx.item) ||
        transactionItem?.name ||
        itemSource.name ||
        "—";
      const skuValue = transactionItem?.sku || itemSource.sku;
      const itemValue = baseItem !== "—" && skuValue ? `${baseItem} (${skuValue})` : baseItem;

      const typeValue =
        tx.type ||
        tx.transactionType ||
        tx.category ||
        linked?.type ||
        fallback?.type ||
        "—";

      const quantityValue =
        typeof tx.quantity === "number"
          ? tx.quantity
          : Number(
              tx.quantity ??
                tx.qty ??
                tx.count ??
                linked?.quantity ??
                fallback?.quantity
            ) || 0;

      const remarksValue = tx.remarks || tx.notes || linked?.remarks || fallback?.remarks || "";

      const purchaseOrderValue =
        tx.purchaseOrderId ||
        tx.purchaseOrder ||
        tx.reference ||
        (linked?.purchaseOrderId ? linked.purchaseOrderId.toString() : undefined) ||
        (fallback?.purchaseOrderId ? fallback.purchaseOrderId.toString() : undefined) ||
        "";

      const dateValue =
        tx.date ||
        tx.transactionDate ||
        tx.createdAt ||
        tx.updatedAt ||
        linked?.transactionDate ||
        fallback?.transactionDate ||
        null;

      return {
        ...tx,
        item: itemValue,
        type: typeValue,
        quantity: Number.isFinite(quantityValue) ? quantityValue : 0,
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
