const express = require("express");
const router = express.Router();
const poController = require("../controllers/purchaseOrder.controller");

// Create
router.post("/", poController.createPO);

// Read
router.get("/", poController.getPOs);
router.get("/:id", poController.getPOById);

// Update
router.put("/:id", poController.updatePO);

// Delete
router.delete("/:id", poController.deletePO);

module.exports = router;
