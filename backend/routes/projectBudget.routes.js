const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/projectBudget.controller");

//Route for FinanceHead to get all projects
router.get("/", ctrl.getAllProjectBudgets);
router.post("/:projectId/sync", ctrl.syncProjectBudget);
router.get("/:projectId", ctrl.getBudgetByProject);
router.put("/:projectId/task/:taskId", ctrl.updateTaskBudget);
router.delete("/:projectId/task/:taskId", ctrl.deleteTask);

module.exports = router;
