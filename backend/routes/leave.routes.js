const express = require("express");
const router = express.Router();
const controller = require("../controllers/leave.controller");

// Get all leave records
router.get("/", controller.getAll);

// Create new leave application
router.post("/", controller.create);

// Update leave application
router.patch("/:id", controller.update);
router.put("/:id", controller.update);

// Get leave by employee
router.get("/employee/:employee", controller.getByEmployee);

// Delete leave record
router.delete("/:id", controller.delete);

module.exports = router;