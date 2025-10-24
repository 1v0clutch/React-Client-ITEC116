const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");

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

// Delete project
//router.delete("/projects/:id", projectController.delete);

// Update project status
//router.patch("/projects/:id/status", projectController.updateStatus);

// Add task to project phase
//router.post("/projects/:id/phases/:phaseId/tasks", projectController.addTask);

module.exports = router;
