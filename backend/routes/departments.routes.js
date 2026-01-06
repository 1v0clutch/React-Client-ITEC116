const express = require("express");
const router = express.Router();
const controller = require("../controllers/department.controller");

// Get all departments
router.get("/", controller.getAll);

// Get department by ID
router.get("/:id", controller.getById);

// Add new department
router.post("/", controller.create);

// Update department
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

// Delete department
router.delete("/:id", controller.delete);

module.exports = router;
