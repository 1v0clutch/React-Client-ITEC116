const Inventory = require("../models/Inventory");
const { validateInventoryItem } = require("../utils/validation");

// Add new inventory item
exports.addItem = async (req, res) => {
  const { error } = validateInventoryItem(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update existing item
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// View all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
