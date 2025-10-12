const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const Supplier = require("../models/Supplier");

// CRUD
router.post("/addSupplier", supplierController.createSupplier);
router.get("/getSupplier", supplierController.getSuppliers);
router.get("/getSupplier/:id", supplierController.getSupplierById);
router.put("/updateSupplier/:id", supplierController.updateSupplier);
router.delete("/deleteSupplier/:id", supplierController.deleteSupplier);

// purchase history
router.get("/getHistory/:id", supplierController.getSupplierHistory);

// ✅ NEW: get product catalog of supplier
router.get("/:id/products", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier.productCatalog); // return only the productCatalog array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
