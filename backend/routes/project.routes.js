const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");

// Create a new project
router.post("/projects", projectController.create);

// Get all projects
router.get("/projects", projectController.findAll);

// Get project by ID
router.get("/projects/:id", projectController.findOne);

// Update project
//router.put("/projects/:id", projectController.update);

// Delete project
//router.delete("/projects/:id", projectController.delete);

// Update project status
//router.patch("/projects/:id/status", projectController.updateStatus);

// Add task to project phase
//router.post("/projects/:id/phases/:phaseId/tasks", projectController.addTask);

// Update task in project
//router.patch(
//  "/projects/:id/phases/:phaseId/tasks/:taskId",
//  projectController.updateTask
//);

module.exports = router;
