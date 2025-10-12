const mongoose = require('mongoose');

const FinanceInventoryTransactionSchema = new mongoose.Schema({
  productId: String,
  quantity: Number,
  transactionType: String,
  unitPrice: Number,
  date: Date,
  remarks: String,
  purchaseOrderId: String
});

module.exports = mongoose.model('FinanceInventoryTransaction', FinanceInventoryTransactionSchema);