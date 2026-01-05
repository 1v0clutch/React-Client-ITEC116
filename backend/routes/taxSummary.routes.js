const express = require("express");
const router = express.Router();

// TEMP sample data (replace later with real invoices/sales)
router.get("/", async (req, res) => {
  try {
    const totalSales = 100000;
    const VAT_RATE = 0.12;

    const vat = totalSales * VAT_RATE;
    const netIncome = totalSales - vat;

    res.json({
      reportType: "Tax Summary",
      totalSales,
      vat,
      netIncome,
      generatedAt: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
