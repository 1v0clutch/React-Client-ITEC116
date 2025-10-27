const express = require("express");
const router = express.Router();
const DemandForecast = require("../models/DemandForecast.model");

// CREATE
router.post("/", async (req, res) => {
  try {
    const forecast = new DemandForecast(req.body);
    await forecast.save();
    console.log("✅ Forecast Saved:", forecast);
    res.status(201).json(forecast);
  } catch (err) {
    console.error("❌ Error Saving Forecast:", err);
    res.status(500).json({ message: "Error saving forecast", error: err.message });
  }
});

// GET
router.get("/", async (req, res) => {
  try {
    const forecasts = await DemandForecast.find();
    res.json(forecasts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch forecasts" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await DemandForecast.findByIdAndDelete(req.params.id);
    res.json({ message: "Forecast deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete forecast" });
  }
});

module.exports = router;
