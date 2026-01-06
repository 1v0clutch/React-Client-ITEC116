const express = require("express");
const router = express.Router();
const controller = require("../controllers/leave.controller");

// Get all leave records
router.get("/", controller.getAll);

// Create new leave application
router.post("/", controller.create);

// Update leave status (approve/reject)
router.patch("/:id", controller.updateStatus);
router.put("/:id", controller.updateStatus);

// Get leave by employee
router.get("/employee/:employee", controller.getByEmployee);

// Get pending leaves
router.get("/pending", controller.getPending);

// Delete leave record
router.delete("/:id", async (req, res) => {
  try {
    const Leave = require("../models/leave.model");
    const deleted = await Leave.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application deleted successfully",
      data: deleted
    });
  } catch (error) {
    console.error("Error deleting leave application:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting leave application",
      error: error.message
    });
  }
});

module.exports = router;