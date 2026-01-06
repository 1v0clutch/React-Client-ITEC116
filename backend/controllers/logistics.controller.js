const LogisticsRoute = require("../models/logistics.model");

// ➕ CREATE Route
exports.createRoute = async (req, res) => {
  try {
    const newRoute = new LogisticsRoute(req.body);
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) {
    console.error("❌ Error creating route:", err);
    res.status(500).json({ message: "Failed to create route", error: err });
  }
};

// 📋 GET All Routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await LogisticsRoute.find();
    res.json(routes);
  } catch (err) {
    console.error("❌ Error fetching routes:", err);
    res.status(500).json({ message: "Failed to fetch routes", error: err });
  }
};

// ✏️ UPDATE Route
exports.updateRoute = async (req, res) => {
  try {
    const updated = await LogisticsRoute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Route not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating route:", err);
    res.status(500).json({ message: "Failed to update route", error: err });
  }
};

// ❌ DELETE Route
exports.deleteRoute = async (req, res) => {
  try {
    const deleted = await LogisticsRoute.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting route:", err);
    res.status(500).json({ message: "Failed to delete route", error: err });
  }
};
