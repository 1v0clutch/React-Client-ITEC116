const express = require("express");
const router = express.Router();
const Invoice = require("../models/invoice.model"); // or Sales model

router.get("/tax-summary", async (req, res) => {
  try {
    const VAT_RATE = 0.12; // 12% VAT (PH standard)

    const result = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" }
        }
      }
    ]);

    const totalSales = result[0]?.totalSales || 0;
    const vat = totalSales * VAT_RATE;
    const netIncome = totalSales - vat;

    res.json({
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
