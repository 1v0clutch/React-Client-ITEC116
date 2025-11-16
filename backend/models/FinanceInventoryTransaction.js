const mongoose = require('mongoose');

const FinanceInventoryTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    default: null,
  },
  itemId: {
    type: String,
    default: null,
  },
  itemSku: {
    type: String,
    default: "",
  },
  item: {
    type: String,
    default: "—",
  },
  type: {
    type: String,
    default: "—",
  },
  quantity: {
    type: Number,
    default: 0,
  },
  remarks: {
    type: String,
    default: "",
  },
  purchaseOrderId: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: null,
  },
});

const FinanceInventoryTransaction = mongoose.model('FinanceInventoryTransaction', FinanceInventoryTransactionSchema);

exports.getInventoryTransactions = async (req, res) => {
  try {
    const transactions = await FinanceInventoryTransaction.find().lean();
    // Fetch item info from Inventory module
    const { data: items } = await axios.get("http://localhost:8000/api/inventory/items");
    const itemMap = {};
    items.forEach(item => { itemMap[item._id] = item; });

    // Replace itemId with real item data
    const result = transactions.map(tx => ({
      ...tx,
      item: itemMap[tx.itemId]?.name || "Unknown",
      type: tx.transactionType,
      quantity: tx.quantity,
      remarks: tx.remarks,
      purchaseOrderId: tx.purchaseOrderId,
      date: tx.date,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = FinanceInventoryTransaction;