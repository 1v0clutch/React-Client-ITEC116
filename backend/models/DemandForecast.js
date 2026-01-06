const mongoose = require("mongoose");

const DemandForecastSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Inventory", 
    required: true 
  },
  forecastPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  predictedDemand: { type: Number, required: true },
  actualDemand: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percentage
  method: { 
    type: String, 
    enum: ["historical", "trend", "seasonal", "regression"],
    default: "historical"
  },
  factors: {
    seasonality: { type: Number, default: 1 },
    trend: { type: Number, default: 0 },
    marketConditions: { type: String }
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "archived"],
    default: "draft"
  }
}, { timestamps: true });

module.exports = mongoose.model("DemandForecast", DemandForecastSchema);