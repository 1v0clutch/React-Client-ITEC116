const express = require("express");
const router = express.Router();
const requisitionController = require("../controllers/requisition.controller");

// Create
router.post("/", requisitionController.createRequisition);

// Read
router.get("/", requisitionController.getRequisitions);
router.get("/:id", requisitionController.getRequisitionById);

// Update
router.put("/:id", requisitionController.updateRequisition);
router.put("/:id/status", requisitionController.updateStatus);

// Delete
router.delete("/:id", requisitionController.deleteRequisition);

module.exports = router;
