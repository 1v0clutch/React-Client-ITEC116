const axios = require("axios");

exports.getSupplierReport = async (req, res) => {
  try {
    // Fetch purchase orders from Procurement module
    const { data: purchaseOrders } = await axios.get("http://localhost:8000/api/procurement/purchase-orders");
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};