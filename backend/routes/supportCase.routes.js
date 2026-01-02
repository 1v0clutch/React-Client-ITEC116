const express = require("express");
const router = express.Router();
const SupportCase = require("../models/SupportCase");

router.get("/", async (req, res) => {
  try {
    const cases = await SupportCase.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const supportCase = await SupportCase.findById(req.params.id);
    if (!supportCase) return res.status(404).json({ message: "Case not found" });
    res.json(supportCase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const supportCase = new SupportCase(req.body);
    await supportCase.save();
    res.status(201).json(supportCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const supportCase = await SupportCase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!supportCase) return res.status(404).json({ message: "Case not found" });
    res.json(supportCase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const supportCase = await SupportCase.findByIdAndDelete(req.params.id);
    if (!supportCase) return res.status(404).json({ message: "Case not found" });
    res.json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
