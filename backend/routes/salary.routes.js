const express = require("express");
const router = express.Router();
const controller = require("../controllers/salary.controller");

// Get all salary records
router.get("/", controller.getAll);

// Get salary by employee
router.get("/employee/:employee", controller.getByEmployee);

// Add salary record
router.post("/", controller.create);

// Update salary record
router.put("/:id", controller.update);
router.patch("/:id", controller.update);

// Delete salary record
router.delete("/:id", controller.delete);

module.exports = router;
