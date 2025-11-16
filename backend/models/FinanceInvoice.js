const mongoose = require('mongoose');

const FinanceInvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  totalAmount: Number,
  supplierId: String,
  dateIssued: Date,
  purchaseOrderId: String,
  items: Array,
  status: String
});

module.exports = mongoose.model('FinanceInvoice', FinanceInvoiceSchema);