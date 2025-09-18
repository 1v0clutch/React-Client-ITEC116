const express = require("express");
const router = express.Router();
const poController = require("../controllers/purchaseOrder.controller");

// CRUD
router.post("/addOrder", poController.createPurchaseOrder);
router.get("/getOrder", poController.getPOs);
router.get("/getOrder/:id", poController.getPOById);

// update status (e.g. delivered, cancelled)
router.put("/:id/status", poController.updatePOStatus);

module.exports = router;