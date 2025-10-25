const DemandForecast = require("../models/DemandForecast");

// ➕ Create new forecast
exports.createForecast = async (req, res) => {
  try {
    const forecast = new DemandForecast(req.body);
    await forecast.save();
    res.status(201).json({ message: "Forecast saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving forecast:", error.message);
    res.status(500).json({ error: "Failed to save forecast." });
  }
};

// 📥 Get all forecasts
exports.getForecasts = async (req, res) => {
  try {
    const forecasts = await DemandForecast.find();
    res.json(forecasts);
  } catch (error) {
    console.error("❌ Error fetching forecasts:", error.message);
    res.status(500).json({ error: "Failed to fetch forecasts." });
  }
};

// 🗑️ Delete forecast
exports.deleteForecast = async (req, res) => {
  try {
    await DemandForecast.findByIdAndDelete(req.params.id);
    res.json({ message: "Forecast deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting forecast:", error.message);
    res.status(500).json({ error: "Failed to delete forecast." });
  }
};
