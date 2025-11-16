const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

// Inventory CRUD
router.post("/addItem", inventoryController.addItem);          // Create new item
router.put("/updateItem/:id", inventoryController.updateItem); // Update item
router.get("/getItems", inventoryController.getAllItems);          // Get all items
router.get("/getItem/:id", inventoryController.getItemById);       // Get item by ID
router.delete("/deleteItem/:id", inventoryController.deleteItem);     // Delete item

module.exports = router;
