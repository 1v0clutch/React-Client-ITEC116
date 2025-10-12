const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");

// Stock-in / Stock-out
router.post("/addTransactionRecord", transactionController.recordTransaction); // Add transaction
router.get("/getTransactionRecords", transactionController.getTransactions);          // Get all transactions
router.get("/", transactionController.getTransactions);

module.exports = router;
