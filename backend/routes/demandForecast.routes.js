const express = require("express");
const router = express.Router();
const DemandForecast = require("../models/DemandForecast");

// CREATE / POST forecast
router.post("/", async (req, res) => {
  try {
    const { product, salesData, forecast, analysis, recommendation, computation } = req.body;

    // Validate required fields
    if (!product || !Array.isArray(salesData) || salesData.length === 0 || !Array.isArray(forecast) || forecast.length === 0) {
      return res.status(400).json({ message: "Missing required fields or forecast not generated yet" });
    }

    const newForecast = new DemandForecast({
      product,
      salesData,
      forecast,
      analysis,
      recommendation,
      computation,
    });

    const saved = await newForecast.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error saving forecast:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all forecasts
router.get("/", async (req, res) => {
  try {
    const forecasts = await DemandForecast.find().sort({ createdAt: -1 });
    res.json(forecasts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE forecast
router.delete("/:id", async (req, res) => {
  try {
    await DemandForecast.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
