import { useState, useEffect } from "react";
import "./Module_8style/Sales_report.css";

function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ product: "", source: "", status: "" });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/sales-orders/all");
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered data
  const filtered = salesData.filter(s =>
    (!filter.product || s.productId?._id === filter.product) &&
    (!filter.source || s.orderSource === filter.source) &&
    (!filter.status || s.status === filter.status)
  );

  // Get unique products for filter
  const uniqueProducts = [...new Set(salesData.map(s => s.productId).filter(Boolean))];

  // Calculate totals
  const totalSales = filtered.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalOrders = filtered.length;
  
  // Sales by source
  const salesBySource = filtered.reduce((acc, s) => {
    const source = s.orderSource || "manual";
    acc[source] = (acc[source] || 0) + (s.totalAmount || 0);
    return acc;
  }, {});

  // Sales by product
  const salesByProduct = filtered.reduce((acc, s) => {
    const productName = s.productId?.name || "Unknown";
    acc[productName] = (acc[productName] || 0) + (s.totalAmount || 0);
    return acc;
  }, {});

  // Sales by status
  const salesByStatus = filtered.reduce((acc, s) => {
    const status = s.status || "pending";
    acc[status] = (acc[status] || 0) + (s.totalAmount || 0);
    return acc;
  }, {});

  // Count by source
  const countBySource = filtered.reduce((acc, s) => {
    const source = s.orderSource || "manual";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Revenue forecast (average per order * 30)
  const avgPerOrder = totalOrders ? (totalSales / totalOrders) : 0;
  const forecastRevenue = Math.round(avgPerOrder * 30);

  // Paid vs Unpaid
  const paidRevenue = filtered
    .filter(s => s.invoiceStatus === "paid")
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const unpaidRevenue = filtered
    .filter(s => s.invoiceStatus === "unpaid")
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  if (loading) {
    return <div className="report-container"><h2>Loading sales data...</h2></div>;
  }

  return (
    <div className="report-container">
      <h2>Sales Performance Reporting & Forecasting</h2>
      
      <div className="form-card">
        <label>Filter by Product</label>
        <select value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })}>
          <option value="">All Products</option>
          {uniqueProducts.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        
        <label>Filter by Source</label>
        <select value={filter.source} onChange={e => setFilter({ ...filter, source: e.target.value })}>
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="quotation">Quotation</option>
        </select>
        
        <label>Filter by Status</label>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processed">Processed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <h3>Sales Data ({filtered.length} orders)</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#ee7829", color: "#fff" }}>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Customer</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Product</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Source</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", border: "1px solid #ddd" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                No sales data available
              </td>
            </tr>
          ) : (
            filtered.map(s => (
              <tr key={s._id} style={{ background: "#fff", color: "#232526", borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {s.customerName || `Customer #${s.customerId}`}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {s.productId?.name || "Unknown"} (x{s.quantity})
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: s.orderSource === "ecommerce" ? "#10b981" : "#6b7280",
                    color: "#fff"
                  }}>
                    {s.orderSource || "manual"}
                  </span>
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                  {s.status}
                </td>
                <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "600" }}>
                  ₱{s.totalAmount?.toFixed(2) || "0.00"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="form-card">
        <h4>Summary</h4>
        <p><strong>Total Orders:</strong> {totalOrders}</p>
        <p><strong>Total Sales:</strong> ₱{totalSales.toFixed(2)}</p>
        <p><strong>Paid Revenue:</strong> ₱{paidRevenue.toFixed(2)}</p>
        <p><strong>Unpaid Revenue:</strong> ₱{unpaidRevenue.toFixed(2)}</p>
        
        <h4 style={{ marginTop: "20px" }}>Sales by Source</h4>
        {Object.entries(salesBySource).map(([source, amount]) => (
          <p key={source}>
            <strong>{source}:</strong> ₱{amount.toFixed(2)} ({countBySource[source]} orders)
          </p>
        ))}
        
        <h4 style={{ marginTop: "20px" }}>Sales by Product</h4>
        {Object.entries(salesByProduct).slice(0, 5).map(([product, amount]) => (
          <p key={product}>
            <strong>{product}:</strong> ₱{amount.toFixed(2)}
          </p>
        ))}
        
        <h4 style={{ marginTop: "20px" }}>Sales by Status</h4>
        {Object.entries(salesByStatus).map(([status, amount]) => (
          <p key={status}>
            <strong>{status}:</strong> ₱{amount.toFixed(2)}
          </p>
        ))}
        
        <h4 style={{ marginTop: "20px" }}>Forecast</h4>
        <p><strong>Average per Order:</strong> ₱{avgPerOrder.toFixed(2)}</p>
        <p><strong>Forecast Revenue (30 orders):</strong> ₱{forecastRevenue.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default SalesReport;
