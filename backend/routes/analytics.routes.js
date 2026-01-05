const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");

router.post("/calculate", analyticsController.calculateCustomerBehavior);
router.get("/behaviors", analyticsController.getCustomerBehaviors);
router.get("/behaviors/:id", analyticsController.getCustomerBehaviorById);
router.get("/customer/:customerId", analyticsController.getBehaviorByCustomerId);
router.get("/summary", analyticsController.getAnalyticsSummary);

module.exports = router;
