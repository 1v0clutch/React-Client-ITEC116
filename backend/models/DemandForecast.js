const mongoose = require("mongoose");

const DemandForecastSchema = new mongoose.Schema({
  product: { type: String, required: true },
  salesData: [{ month: String, sales: Number }],
  forecast: [{ month: String, value: Number }],
  analysis: { totalSales: Number, averageSales: String, growthRate: String, lastQuarterAvg: String },
  recommendation: String,
  computation: String,
}, { timestamps: true });

module.exports = mongoose.model("DemandForecast", DemandForecastSchema);
