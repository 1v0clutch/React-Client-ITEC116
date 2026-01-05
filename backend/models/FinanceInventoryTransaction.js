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

module.exports = mongoose.model('FinanceInventoryTransaction', FinanceInventoryTransactionSchema);