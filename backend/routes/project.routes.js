const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const projectBudgetController = require("../controllers/projectBudget.controller");

// Create a new project
router.post("/projects", projectController.create);

// Get all projects
router.get("/projects", projectController.findAll);

// Get project by ID
router.get("/projects/:id", projectController.findOne);

router.get("/gantt/:id", projectController.getGanttById);

router.put("/projects/:id/tasks", projectController.updateTasks);

router.put("/projects/:id", projectController.updateProject);

router.put("/projects/assign-employee", projectController.assignEmployee);

// Get all tasks (grouped by phase) for a specific project
router.get("/projects/:id/tasks", projectController.getProjectTasks);

router.delete("/projects/:id", projectController.deleteProject);

router.get(
  "/projects/:id/allocations",
  projectController.getResourceAllocations
);
router.post(
  "/projects/:projectId/allocations",
  projectController.addResourceAllocation
);
router.put(
  "/projects/:projectId/allocations",
  projectController.updateResourceAllocations
);
router.delete(
  "/projects/:projectId/allocations/:allocationId",
  projectController.deleteResourceAllocation
);

// NEW: Inventory & Procurement Integration Routes
router.get("/:id/inventory", projectController.getProjectInventory);
router.post("/:id/requisitions", projectController.createMaterialRequisition);
router.post(
  "/:id/allocate-inventory",
  projectController.allocateInventoryToTask
);
router.get("/:id/material-status", projectController.getProjectMaterialStatus);

// NEW: Budget & Material Cost Routes
router.get(
  "/:id/budget/material-costs",
  projectBudgetController.getProjectMaterialStatus
);
router.put(
  "/:projectId/task/:taskId/material",
  projectBudgetController.updateTaskMaterialCost
);
router.get(
  "/:id/procurement-status",
  projectBudgetController.getProjectProcurementStatus
);

module.exports = router;
