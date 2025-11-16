const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouse.controller");

// Warehouse Management
router.post("/addWarehouse", warehouseController.addWarehouse);         // Create warehouse
router.get("/getAllWarehouse", warehouseController.getWarehouses); //fetch all warehouses
router.get("/getWarehouse/:id", warehouseController.getWarehouseById); //get warehouse by id
router.post("/assignItem", warehouseController.assignItem);        // Assign item to warehouse
router.post("/transferItem", warehouseController.transferItem);    // Transfer between warehouses
router.delete("/deleteWarehouse/:id", warehouseController.deleteWarehouse) //Delete warehouse

module.exports = router;
