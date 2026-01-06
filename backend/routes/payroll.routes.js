const express = require("express");
const router = express.Router();
const controller = require("../controllers/payroll.controller");

// Get all payroll records
router.get("/", controller.getAll);

// Get payroll by employee
router.get("/employee/:employeeId", controller.getByEmployee);

// Get payroll by period
router.get("/period/:payPeriod", controller.getByPeriod);

// Add payroll record
router.post("/", controller.create);

// Update payroll record
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

// Delete payroll record
router.delete("/:id", controller.delete);

module.exports = router;
