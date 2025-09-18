const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoice.controller");

// CRUD
router.post("/addInvoice", invoiceController.createInvoice);
router.get("/getInvoice", invoiceController.getInvoices);
router.get("/getInvoice/:id", invoiceController.getInvoiceById);

module.exports = router;