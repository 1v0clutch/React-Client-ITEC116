import { useState, useEffect } from "react";
import "./Module_8style/Sales_report.css";

function SalesReport() {
  const [salesData, setSalesData] = useState([]);
  const [targets, setTargets] = useState([]);
  const [filter, setFilter] = useState({ product: "", region: "", rep: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, targetsRes] = await Promise.all([
        fetch("http://localhost:8000/api/sales-orders/all"),
        fetch("http://localhost:8000/api/sales-targets"),
      ]);
      const sales = await salesRes.json();
      const targetsList = await targetsRes.json();
      setSalesData(Array.isArray(sales) ? sales : []);
      setTargets(Array.isArray(targetsList) ? targetsList : []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonth = () => new Date().toLocaleString("default", { month: "2-digit" });
  const getCurrentYear = () => new Date().getFullYear();

  const filtered = salesData.filter(s => {
    const productMatch = !filter.product || s.productId?.name === filter.product || s.product === filter.product;
    const regionMatch = !filter.region;
    const repMatch = !filter.rep;
    return productMatch && regionMatch && repMatch;
  });

  const getProductName = (sale) => sale.productId?.name || sale.product || "Unknown";

  const totalSales = filtered.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const salesByProduct = salesData.reduce((acc, s) => {
    const product = getProductName(s);
    acc[product] = (acc[product] || 0) + (s.totalAmount || 0);
    return acc;
  }, {});

  const daysSinceStart = Math.max(1, Math.floor((new Date() - new Date(salesData[0]?.createdAt)) / (1000 * 60 * 60 * 24)) || 1);
  const avgPerDay = salesData.length ? totalSales / daysSinceStart : 0;
  const forecastRevenue = Math.round(avgPerDay * 30);

  const getWeeklyTrend = () => {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayAmount = salesData.filter(s => s.createdAt?.split("T")[0] === dateStr).reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      week.push({ date: dateStr, amount: dayAmount });
    }
    return week;
  };

  const weeklyTrend = getWeeklyTrend();
  const avgWeekly = weeklyTrend.reduce((sum, w) => sum + w.amount, 0) / 7;

  const getMonthlyComparison = () => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const currentMonthSales = salesData
      .filter(s => new Date(s.createdAt).getMonth() === parseInt(currentMonth) - 1 && new Date(s.createdAt).getFullYear() === currentYear)
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const lastMonthSales = salesData
      .filter(s => {
        const date = new Date(s.createdAt);
        const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1);
        return lastMonth.getMonth() === date.getMonth() - 1 && lastMonth.getFullYear() === date.getFullYear();
      })
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const growth = lastMonthSales ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 0;
    return { currentMonthSales, lastMonthSales, growth };
  };

  const monthlyComparison = getMonthlyComparison();

  const getProductVelocity = () => {
    const productSales = {};
    salesData.forEach(s => {
      const product = getProductName(s);
      if (!productSales[product]) productSales[product] = { count: 0, total: 0 };
      productSales[product].count += 1;
      productSales[product].total += s.totalAmount || 0;
    });
    return Object.entries(productSales)
      .map(([product, { count, total }]) => ({ product, count, total, velocity: count / daysSinceStart }))
      .sort((a, b) => b.velocity - a.velocity);
  };

  const productVelocity = getProductVelocity();

  const getPerformanceVsTarget = () => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const relevantTargets = targets.filter(t => t.month === currentMonth && t.year === currentYear);
    return relevantTargets.map(target => {
      const actualSales = salesData
        .filter(s => {
          const productName = getProductName(s);
          return productName === target.product && new Date(s.createdAt).getMonth() === parseInt(currentMonth) - 1;
        })
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      const performance = target.targetAmount ? (actualSales / target.targetAmount) * 100 : 0;
      return { ...target, actualSales, performance };
    });
  };

  const performanceVsTarget = getPerformanceVsTarget();

  const getMarketingInsights = () => {
    const insights = [];
    productVelocity.slice(0, 3).forEach(p => {
      insights.push(`📈 High demand: ${p.product} (${p.count} orders) - increase inventory`);
    });
    const underperformers = performanceVsTarget.filter(p => p.performance < 50);
    underperformers.forEach(p => {
      insights.push(`⚠️ ${p.product} underperforming (${p.performance.toFixed(0)}% of target) - review pricing or marketing`);
    });
    const trendDown = monthlyComparison.growth < 0;
    if (trendDown) {
      insights.push(`📉 Monthly sales declining (${monthlyComparison.growth.toFixed(1)}%) - implement promotional strategy`);
    }
    return insights;
  };

  const insights = getMarketingInsights();

  if (loading) return <div className="report-container"><p>Loading sales data...</p></div>;

  return (
    <div className="report-container">
      <h2>Sales Performance Reporting & Forecasting</h2>

      <div className="form-card">
        <label>Filter by Product</label>
        <select value={filter.product} onChange={e => setFilter({ ...filter, product: e.target.value })}>
          <option value="">All Products</option>
          {Object.keys(salesByProduct).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px", width: "100%", maxWidth: "1200px" }}>
        <div className="metric-card" style={{ background: "#e3f2fd", padding: "20px", borderRadius: "8px", border: "2px solid #0ea5e9" }}>
          <h4 style={{ color: "#1976d2", margin: "0 0 10px 0" }}>Total Sales</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0", color: "#0d47a1" }}>${totalSales.toFixed(2)}</p>
          <p style={{ fontSize: "12px", color: "#555" }}>Current Period</p>
        </div>
        <div className="metric-card" style={{ background: "#fffde7", padding: "20px", borderRadius: "8px", border: "2px solid #fbbf24" }}>
          <h4 style={{ color: "#f57f17", margin: "0 0 10px 0" }}>30-Day Forecast</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0", color: "#e65100" }}>${forecastRevenue.toFixed(0)}</p>
          <p style={{ fontSize: "12px", color: "#555" }}>Projected Revenue</p>
        </div>
        <div className="metric-card" style={{ background: "#f1f8e9", padding: "20px", borderRadius: "8px", border: "2px solid #66bb6a" }}>
          <h4 style={{ color: "#2e7d32", margin: "0 0 10px 0" }}>Monthly Growth</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0", color: monthlyComparison.growth >= 0 ? "#1b5e20" : "#c62828" }}>
            {monthlyComparison.growth.toFixed(1)}%
          </p>
          <p style={{ fontSize: "12px", color: "#555" }}>vs Last Month</p>
        </div>
        <div className="metric-card" style={{ background: "#fce4ec", padding: "20px", borderRadius: "8px", border: "2px solid #ec407a" }}>
          <h4 style={{ color: "#c2185b", margin: "0 0 10px 0" }}>Avg Daily Sales</h4>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0", color: "#880e4f" }}>${avgPerDay.toFixed(2)}</p>
          <p style={{ fontSize: "12px", color: "#555" }}>7-Day Average</p>
        </div>
      </div>

      <h3>Performance vs Targets</h3>
      {performanceVsTarget.length > 0 ? (
        <table style={{ width: "100%", maxWidth: "1200px", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#ee7829", fontWeight: "600" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Target</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Actual</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {performanceVsTarget.map((p, i) => (
              <tr key={i} style={{ background: "#fff" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{p.product}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${p.targetAmount.toFixed(2)}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${p.actualSales.toFixed(2)}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "600", color: p.performance >= 100 ? "#1b5e20" : p.performance >= 75 ? "#e65100" : "#c62828" }}>
                  {p.performance.toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#666", marginBottom: "20px" }}>No sales targets set for this month</p>
      )}

      <h3>Product Velocity Analysis</h3>
      {productVelocity.length > 0 ? (
        <table style={{ width: "100%", maxWidth: "1200px", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#ee7829", fontWeight: "600" }}>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Product</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Orders</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Total Revenue</th>
              <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Orders/Day</th>
            </tr>
          </thead>
          <tbody>
            {productVelocity.map((p, i) => (
              <tr key={i} style={{ background: "#fff" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "600", color: "#232526" }}>{p.product}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{p.count}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${p.total.toFixed(2)}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{p.velocity.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: "#666", marginBottom: "20px" }}>No sales data available</p>
      )}

      <h3>Weekly Sales Trend</h3>
      <table style={{ width: "100%", maxWidth: "1200px", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#ee7829", color: "#fff", fontWeight: "600" }}>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Sales Amount</th>
          </tr>
        </thead>
        <tbody>
          {weeklyTrend.map((w, i) => (
            <tr key={i} style={{ background: "#fff" }}>
              <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{w.date}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${w.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ background: "#f0f0f0", fontWeight: "600" }}>
            <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>7-Day Average</td>
            <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${avgWeekly.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <h3>Marketing & Inventory Recommendations</h3>
      <div className="form-card" style={{ background: "#ffffff", borderLeft: "4px solid #ee7829", color: "#232526", maxWidth: "1200px", width: "100%" }}>
        {insights.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {insights.map((insight, i) => (
              <li key={i} style={{ padding: "12px 0", borderBottom: i < insights.length - 1 ? "1px solid #e0e0e0" : "none", color: "#232526" }}>
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666", margin: 0 }}>No actionable insights at this time</p>
        )}
      </div>

      <h3>Sales Data</h3>
      <table style={{ width: "100%", maxWidth: "1200px", borderCollapse: "collapse", marginBottom: "20px", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#ee7829", fontWeight: "600" }}>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Date</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Product</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Status</th>
            <th style={{ padding: "12px", textAlign: "left", border: "1px solid #ddd", color: "#fff" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map(s => (
              <tr key={s._id} style={{ background: "#fff" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{getProductName(s)}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>{s.status}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd", color: "#232526" }}>${s.totalAmount.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: "12px", textAlign: "center", color: "#666" }}>No sales data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SalesReport;
