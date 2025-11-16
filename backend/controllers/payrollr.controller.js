const axios = require("axios");

exports.getPayrollReport = async (req, res) => {
  try {
    // Fetch payroll data from HR module
    const { data: payrolls } = await axios.get("http://localhost:8000/api/hr/payroll");
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};