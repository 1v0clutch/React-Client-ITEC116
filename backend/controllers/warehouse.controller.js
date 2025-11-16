const Warehouse = require("../models/Warehouse");
const Inventory = require("../models/Inventory");
const { validateWarehouse, validateWarehouseTransfer } = require("../utils/validation");

// Add new warehouse
exports.addWarehouse = async (req, res) => {
  const { error } = validateWarehouse(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const warehouse = new Warehouse(req.body);
    await warehouse.save();
    res.status(201).json({ message: "Warehouse added successfully", warehouse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all warehouses
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find()
      .populate("items.itemId", "name sku category quantity");
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get warehouse by ID
exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate("items.itemId", "name sku category quantity");
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign item to warehouse (no duplicates)
exports.assignItem = async (req, res) => {
  try {
    const { warehouseId, itemId, quantity, zone } = req.body;

    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });

    const item = await Inventory.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Check if item already exists in this warehouse
    const existingItem = warehouse.items.find(i => i.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity = quantity;
      if (zone) existingItem.zone = zone;
    } else {
      warehouse.items.push({ itemId, quantity, zone });
    }

    await warehouse.save();

    res.json({ message: "Item assigned to warehouse", warehouse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Transfer item between warehouses
exports.transferItem = async (req, res) => {
  const { error } = validateWarehouseTransfer(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { fromWarehouseId, toWarehouseId, itemId, quantity } = req.body;

    const fromWarehouse = await Warehouse.findById(fromWarehouseId);
    const toWarehouse = await Warehouse.findById(toWarehouseId);

    if (!fromWarehouse || !toWarehouse) {
      return res.status(404).json({ error: "One or both warehouses not found" });
    }

    // Deduct from source
    const fromItem = fromWarehouse.items.find(i => i.itemId.toString() === itemId);
    if (!fromItem || Number(fromItem.quantity) < Number(quantity)) {
      return res.status(400).json({ error: "Not enough stock in source warehouse" });
    }

    fromItem.quantity = Number(fromItem.quantity) - Number(quantity);

    // ✅ If source item is now 0, remove it from array
    if (fromItem.quantity <= 0) {
      fromWarehouse.items = fromWarehouse.items.filter(i => i.itemId.toString() !== itemId);
    }

    // Add to destination
    const toItem = toWarehouse.items.find(i => i.itemId.toString() === itemId);
    if (toItem) {
      toItem.quantity = Number(toItem.quantity) + Number(quantity);
    } else {
      toWarehouse.items.push({ itemId, quantity: Number(quantity) });
    }

    await fromWarehouse.save();
    await toWarehouse.save();

    res.json({ message: "Item transferred successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete warehouse (only block if items with >0 quantity exist)
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });

    // Filter active items
    const activeItems = warehouse.items.filter(i => i.quantity > 0);

    if (activeItems.length > 0) {
      return res.status(400).json({ error: "Cannot delete warehouse with active stock" });
    }

    await Warehouse.findByIdAndDelete(req.params.id);
    res.json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
