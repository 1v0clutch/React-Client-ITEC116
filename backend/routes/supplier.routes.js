const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");

// Create
router.post("/", supplierController.createSupplier);

// Read
router.get("/", supplierController.getSuppliers);
router.get("/:id", supplierController.getSupplierById);

// Update
router.put("/:id", supplierController.updateSupplier);

// Delete
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
