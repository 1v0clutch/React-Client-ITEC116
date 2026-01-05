const express = require("express");
const router = express.Router();
const crmController = require("../controllers/crm.controller");

router.get("/customers", crmController.getCustomers);
router.post("/customers", crmController.createCustomer);
router.post("/customers/:id/logs", crmController.addLog);
router.put("/customers/:id/logs/:logId", crmController.updateLog);
router.delete("/customers/:id/logs/:logId", crmController.deleteLog);

module.exports = router;
