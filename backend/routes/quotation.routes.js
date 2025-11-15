const express = require("express");
const router = express.Router();
const quotationController = require("../controllers/quotation.controller");

router.post("/create", quotationController.createQuotation);
router.get("/all", quotationController.getAllQuotations);
router.get("/:id", quotationController.getQuotationById);
router.put("/update/:id", quotationController.updateQuotation);
router.delete("/delete/:id", quotationController.deleteQuotation);
router.get("/customer/:customerId", quotationController.getQuotationsByCustomer);
router.put("/status/:id", quotationController.updateQuotationStatus);
router.put("/convert/:id", quotationController.convertToOrder);
router.put("/reject/:id", quotationController.rejectQuotation);

module.exports = router;
