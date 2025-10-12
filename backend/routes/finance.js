const express = require('express');
const router = express.Router();
const FinanceController = require('../controllers/finance.controller');

router.post('/inventory-transaction', FinanceController.handleInventoryTransaction); // <-- fix here
router.get('/inventory-transactions', FinanceController.getInventoryTransactions);

module.exports = router;