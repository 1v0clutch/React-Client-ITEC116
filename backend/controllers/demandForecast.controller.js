<<<<<<< HEAD
const DemandForecast = require("../models/DemandForecast");
const Inventory = require("../models/Inventory");

// Create demand forecast
=======
const DemandForecast = require('../demandForecast.model');

// CREATE
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
exports.createForecast = async (req, res) => {
  try {
    const forecast = new DemandForecast(req.body);
    await forecast.save();
<<<<<<< HEAD
    await forecast.populate("itemId", "name sku category");
    res.status(201).json({ message: "Demand forecast created", forecast });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all forecasts
exports.getAllForecasts = async (req, res) => {
  try {
    const forecasts = await DemandForecast.find()
      .populate("itemId", "name sku category quantity")
      .sort({ createdAt: -1 });
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get forecast by item
exports.getForecastByItem = async (req, res) => {
  try {
    const forecasts = await DemandForecast.find({ itemId: req.params.itemId })
      .populate("itemId", "name sku category quantity")
      .sort({ "forecastPeriod.startDate": -1 });
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update forecast accuracy
exports.updateAccuracy = async (req, res) => {
  try {
    const { actualDemand } = req.body;
    const forecast = await DemandForecast.findById(req.params.id);
    
    if (!forecast) {
      return res.status(404).json({ error: "Forecast not found" });
    }

    forecast.actualDemand = actualDemand;
    forecast.accuracy = Math.round((1 - Math.abs(forecast.predictedDemand - actualDemand) / forecast.predictedDemand) * 100);
    forecast.status = "completed";
    
    await forecast.save();
    res.json({ message: "Forecast accuracy updated", forecast });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate forecast based on historical data
exports.generateHistoricalForecast = async (req, res) => {
  try {
    const { itemId, months = 3 } = req.body;
    
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Simple historical average (in real scenario, you'd use more sophisticated algorithms)
    const historicalForecasts = await DemandForecast.find({ 
      itemId, 
      status: "completed" 
    }).limit(6);

    let predictedDemand = item.quantity * 0.1; // Default 10% of current stock
    
    if (historicalForecasts.length > 0) {
      const avgDemand = historicalForecasts.reduce((sum, f) => sum + f.actualDemand, 0) / historicalForecasts.length;
      predictedDemand = Math.round(avgDemand * 1.1); // 10% buffer
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const forecast = new DemandForecast({
      itemId,
      forecastPeriod: { startDate, endDate },
      predictedDemand,
      method: "historical",
      status: "active"
    });

    await forecast.save();
    await forecast.populate("itemId", "name sku category");
    
    res.status(201).json({ message: "Historical forecast generated", forecast });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
=======
    res.status(201).json(forecast);
  } catch (err) {
    console.error('❌ Error saving forecast:', err);
    res.status(500).json({ message: 'Error saving forecast', error: err });
  }
};
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
