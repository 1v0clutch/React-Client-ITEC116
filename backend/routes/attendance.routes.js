const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendance.controller");

// Get all attendance records
router.get("/", controller.getAll);

// Create new attendance record
router.post("/", controller.create);

// Update attendance record
router.patch("/:id", controller.update);
router.put("/:id", controller.update);

// Get attendance by employee
router.get("/employee/:employee", controller.getByEmployee);

// Delete attendance record
router.delete("/:id", controller.delete);

module.exports = router;