import { useState } from "react";
import "./Module_8style/Sales_report.css";
// Dummy data for demonstration
const salesData = [
  { id: 1, product: "Product A", region: "North", rep: "Alice", amount: 1200, date: "2025-10-01" },
  { id: 2, product: "Product B", region: "South", rep: "Bob", amount: 900, date: "2025-10-02" },
  { id: 3, product: "Product A", region: "East", rep: "Charlie", amount: 1500, date: "2025-10-03" },
  { id: 4, product: "Product B", region: "West", rep: "Alice", amount: 1100, date: "2025-10-04" },
];

function SalesReport() {
  const [filter, setFilter] = useState({ product: "", region: "", rep: "" });

  // Filtered data
  const filtered = salesData.filter(s =>
    (!filter.product || s.product === filter.product) &&
    (!filter.region || s.region === filter.region) &&
    (!filter.rep || s.rep === filter.rep)
  );

  // Calculate totals
  const totalSales = filtered.reduce((sum, s) => sum + s.amount, 0);
  const salesByProduct = salesData.reduce((acc, s) => {
    acc[s.product] = (acc[s.product] || 0) + s.amount;
    return acc;
  }, {});
  const salesByRegion = salesData.reduce((acc, s) => {
    acc[s.region] = (acc[s.region] || 0) + s.amount;
    return acc;
  }, {});
  const salesByRep = salesData.reduce((acc, s) => {
    acc[s.rep] = (acc[s.rep] || 0) + s.amount;
    return acc;
  }, {});

  // Simple revenue forecast (average per day * 30)
  const avgPerDay = salesData.length ? (salesData.reduce((sum, s) => sum + s.amount, 0) / salesData.length) : 0;
  const forecastRevenue = Math.round(avgPerDay * 30);

  return (
    <div className="report-container">
      <h2>Sales Performance Reporting & Forecasting</h2>
      <div className="form-card">
        <label>Filter by Product</label>
        <select value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })}>
          <option value="">All</option>
          <option value="Product A">Product A</option>
          <option value="Product B">Product B</option>
        </select>
        <label>Filter by Region</label>
        <select value={filter.region} onChange={e => setFilter({ ...filter, region: e.target.value })}>
          <option value="">All</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
        <label>Filter by Sales Rep</label>
        <select value={filter.rep} onChange={e => setFilter({ ...filter, rep: e.target.value })}>
          <option value="">All</option>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
          <option value="Charlie">Charlie</option>
        </select>
      </div>
      <h3>Sales Data</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#ee7829", color: "#fff" }}>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Product</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Region</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Rep</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.id} style={{ background: "#fff", color: "#232526", borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.date}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.product}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.region}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{s.rep}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>${s.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="form-card">
        <h4>Summary</h4>
        <p>Total Sales: ${totalSales}</p>
        <p>Sales by Product: {Object.entries(salesByProduct).map(([k, v]) => `${k}: $${v}`).join(", ")}</p>
        <p>Sales by Region: {Object.entries(salesByRegion).map(([k, v]) => `${k}: $${v}`).join(", ")}</p>
        <p>Sales by Rep: {Object.entries(salesByRep).map(([k, v]) => `${k}: $${v}`).join(", ")}</p>
        <p>Forecast Revenue (30 days): ${forecastRevenue}</p>
      </div>
    </div>
  );
}

export default SalesReport;
