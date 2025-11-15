const express = require("express");
const router = express.Router();
const Procurement = require("../models/procurement.model");

// GET all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Procurement.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new supplier
router.post("/", async (req, res) => {
  const { supplierName, item, rating, avgDelay } = req.body;
  const supplier = new Procurement({ supplierName, item, rating, avgDelay });

  try {
    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supplier
router.delete("/:id", async (req, res) => {
  try {
    await Procurement.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
