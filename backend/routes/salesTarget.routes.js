const express = require("express");
const router = express.Router();
const SalesTarget = require("../models/SalesTarget");

router.get("/", async (req, res) => {
  try {
    const targets = await SalesTarget.find();
    res.json(targets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const target = await SalesTarget.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "Target not found" });
    res.json(target);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const target = new SalesTarget(req.body);
    await target.save();
    res.status(201).json(target);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const target = await SalesTarget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(target);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await SalesTarget.findByIdAndDelete(req.params.id);
    res.json({ message: "Target deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
