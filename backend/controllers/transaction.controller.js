const Transaction = require("../models/Transaction");
const Inventory = require("../models/Inventory");
const { validateTransaction } = require("../utils/validation");
const axios = require('axios');

// Record stock-in or stock-out
exports.recordTransaction = async (req, res) => {
  try {
    const { error, value } = validateTransaction(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { itemId, type, quantity, remarks, expiryDate, purchaseOrderId } = value;

    const item = await Inventory.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Update inventory quantity
    if (type === "stock-in") {
      item.quantity += quantity;
    } else if (type === "stock-out") {
      if (item.quantity < quantity) {
        return res.status(400).json({ error: "Not enough stock available" });
      }
      item.quantity -= quantity;
    }

    await item.save();

    // Save transaction record
    const transaction = new Transaction({
      itemId,
      type,
      quantity,
      remarks,
      expiryDate,
      purchaseOrderId,
    });
    await transaction.save();

    res
      .status(201)
      .json({
        message: "Transaction recorded successfully",
        transaction,
        item,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
    .populate("itemId","name sku")
    .populate("purchaseOrderId", "status orderDate");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { productId, quantity, transactionType, unitPrice, date, remarks, purchaseOrderId } = req.body;
    // Save transaction in Inventory DB
    const transaction = new Transaction({ productId, quantity, transactionType, unitPrice, date, remarks, purchaseOrderId });
    await transaction.save();

    // Send transaction to Finance
    await axios.post('http://localhost:8000/api/finance/inventory-transaction', {
      productId,
      quantity,
      transactionType,
      unitPrice,
      date,
      remarks,
      purchaseOrderId
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
