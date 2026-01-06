const LogisticsRoute = require("../models/LogisticsRoute");
const Warehouse = require("../models/Warehouse");
const Supplier = require("../models/Supplier");

// Create logistics route
exports.createRoute = async (req, res) => {
  try {
    const route = new LogisticsRoute(req.body);
    
    // Calculate total cost
    route.cost.total = (route.cost.perKm * route.distance) + route.cost.fixed;
    
    await route.save();
    res.status(201).json({ message: "Logistics route created", route });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await LogisticsRoute.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get routes by origin type (warehouse/supplier)
exports.getRoutesByOrigin = async (req, res) => {
  try {
    const { type, locationId } = req.params;
    const routes = await LogisticsRoute.find({
      "origin.type": type,
      "origin.locationId": locationId
    });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get optimal route between two points
exports.getOptimalRoute = async (req, res) => {
  try {
    const { originType, originId, destinationType, destinationId } = req.query;
    
    const routes = await LogisticsRoute.find({
      "origin.type": originType,
      "origin.locationId": originId,
      "destination.type": destinationType,
      "destination.locationId": destinationId,
      status: "active"
    }).sort({ "cost.total": 1 }); // Sort by cost, lowest first

    if (routes.length === 0) {
      return res.status(404).json({ error: "No routes found between specified locations" });
    }

    res.json({ 
      message: "Optimal route found", 
      optimalRoute: routes[0],
      alternatives: routes.slice(1, 3) // Show up to 2 alternatives
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update route status
exports.updateRouteStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const route = await LogisticsRoute.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    
    res.json({ message: "Route status updated", route });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get route efficiency report
exports.getRouteEfficiency = async (req, res) => {
  try {
    const routes = await LogisticsRoute.find({ status: "active" });
    
    const efficiency = routes.map(route => ({
      routeId: route._id,
      routeName: route.routeName,
      costPerKm: route.cost.perKm,
      timeEfficiency: route.distance / route.estimatedTime, // km/hour
      costEfficiency: route.cost.total / route.distance, // cost per km
      utilizationScore: route.capacity.weight ? (route.capacity.weight * 0.8) : 100 // 80% capacity target
    }));

    res.json({ 
      message: "Route efficiency report generated",
      totalRoutes: routes.length,
      efficiency 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};