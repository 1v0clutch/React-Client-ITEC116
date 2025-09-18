const express = require("express");
const router = express.Router();
const requisitionController = require("../controllers/requisition.controller");

// CRUD
router.post("/addRequisition", requisitionController.createRequisition);
router.get("/getRequisition", requisitionController.getRequisitions);
router.get("/getRequisition/:id", requisitionController.getRequisitionById);

// approve/reject requisition
router.put("/:id/status", requisitionController.updateRequisitionStatus);

// optional: create PO from requisition
router.post("/:id/create-po", requisitionController.createPOFromRequisition);

module.exports = router;