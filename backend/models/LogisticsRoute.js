const mongoose = require("mongoose");

const LogisticsRouteSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  origin: {
    type: { type: String, enum: ["warehouse", "supplier"], required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    address: { type: String, required: true }
  },
  destination: {
    type: { type: String, enum: ["warehouse", "customer"], required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId },
    address: { type: String, required: true }
  },
  distance: { type: Number, required: true }, // in kilometers
  estimatedTime: { type: Number, required: true }, // in hours
  transportMode: {
    type: String,
    enum: ["truck", "ship", "air", "rail"],
    default: "truck"
  },
  cost: {
    perKm: { type: Number, default: 0 },
    fixed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  capacity: {
    weight: { type: Number }, // in kg
    volume: { type: Number }  // in cubic meters
  },
  status: {
    type: String,
    enum: ["active", "inactive", "maintenance"],
    default: "active"
  },
  schedule: {
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "on-demand"] },
    days: [{ type: String }] // ["monday", "wednesday", "friday"]
  }
}, { timestamps: true });

module.exports = mongoose.model("LogisticsRoute", LogisticsRouteSchema);