const express = require("express");
const router = express.Router();
const controller = require("../controllers/employee.controller");

// Get all employees
router.get("/", controller.getAll);

// Get employee by ID
router.get("/:id", controller.getById);

// Add new employee
router.post("/", controller.create);

// Update employee
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

// Delete employee
router.delete("/:id", controller.delete);

module.exports = router;
