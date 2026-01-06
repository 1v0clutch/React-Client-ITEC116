const mongoose = require("mongoose");

const demandForecastSchema = new mongoose.Schema({
  product: { type: String, required: true },
  salesData: { type: Array, required: true },
  forecast: { type: Array },
  analysis: { type: Object },
  recommendation: { type: String },
  computation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("DemandForecast", demandForecastSchema);
