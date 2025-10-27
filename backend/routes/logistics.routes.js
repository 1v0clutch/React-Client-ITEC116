const express = require("express");
const router = express.Router();
const logisticsController = require("../controllers/logistics.controller");

// CREATE
router.post("/", logisticsController.createRoute);

// READ
router.get("/", logisticsController.getAllRoutes);

// UPDATE
router.put("/:id", logisticsController.updateRoute);

// DELETE
router.delete("/:id", logisticsController.deleteRoute);

module.exports = router;
