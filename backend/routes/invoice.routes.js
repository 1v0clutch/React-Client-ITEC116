const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");

// Create
router.post("/", invoiceController.createInvoice);

// Read
router.get("/", invoiceController.getInvoices);

// Delete
router.delete("/:id", invoiceController.deleteInvoice);


module.exports = router;
