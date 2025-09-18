const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");

// CRUD
router.post("/addSupplier", supplierController.createSupplier);
router.get("/getSupplier", supplierController.getSuppliers);
router.get("/getSupplier/:id", supplierController.getSupplierById);
router.put("/updateSupplier/:id", supplierController.updateSupplier);
router.delete("/deleteSupplier/:id", supplierController.deleteSupplier);

// purchase history
router.get("/:id/history", supplierController.getSupplierHistory);

module.exports = router;