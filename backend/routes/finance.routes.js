const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/finance.controller');

router.get('/supplier-report', FinanceController.getSupplierReport);
router.get('/inventory-transactions', FinanceController.getInventoryTransactions);
router.get('/payroll-report', FinanceController.getPayrollReport);
router.post('/inventory-transaction', FinanceController.handleInventoryTransaction);
router.post('/recordInvoice', FinanceController.recordInvoice);
// router.post('/payroll', FinanceController.receivePayroll); // Optional

module.exports = router;