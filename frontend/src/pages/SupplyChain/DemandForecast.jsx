import React, { useState, useEffect } from "react";
import axios from "axios";

function DemandForecast() {
  const monthsList = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const [product, setProduct] = useState("");
  const [salesData, setSalesData] = useState([{ month: "January", sales: "" }]);
  const [forecastCount, setForecastCount] = useState(3);
  const [forecast, setForecast] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [recommendation, setRecommendation] = useState("");
  const [computation, setComputation] = useState("");
  const [savedForecasts, setSavedForecasts] = useState([]);

  const API_URL = "http://localhost:5000/api/demand-forecast";

  // ➕ Add month
  const addMonth = () => {
    if (salesData.length < 12) setSalesData([...salesData, { month: "January", sales: "" }]);
  };

  // ➖ Remove month
  const removeMonth = () => {
    if (salesData.length > 1) setSalesData(salesData.slice(0, -1));
  };

  // Handle input
  const handleInputChange = (index, key, value) => {
    const newData = [...salesData];
    newData[index][key] = key === "sales" ? (value === "" ? "" : parseFloat(value)) : value;
    setSalesData(newData);
  };

  // Forecast computation
  const analyzeAndForecast = () => {
    const validSales = salesData.map(d => d.sales).filter(x => !isNaN(x) && x > 0);
    if (!product.trim()) return alert("Enter product name");
    if (validSales.length < 3) return alert("Enter at least 3 months of valid sales data");

    const totalSales = validSales.reduce((a, b) => a + b, 0);
    const averageSales = totalSales / validSales.length;
    const growthRate = (validSales[validSales.length - 1] - validSales[0]) / validSales[0];
    const lastQuarterAvg = validSales.slice(-3).reduce((a, b) => a + b, 0) / 3;

    const seasonalFactor = [1.05, 1.08, 1.10, 1.12, 1.06, 1.09];
    const forecastData = [];

    for (let i = 0; i < forecastCount; i++) {
      const factor = seasonalFactor[i % seasonalFactor.length];
      const value = Math.round(lastQuarterAvg * (1 + growthRate / 12) * factor);
      forecastData.push({ month: `Month ${i + 1}`, value });
    }

    const nextDemand = forecastData[forecastData.length - 1].value;
    let suggestion = "";
    if (nextDemand > averageSales * 1.15) suggestion = "Increase production and procurement.";
    else if (nextDemand < averageSales * 0.85) suggestion = "Reduce procurement to prevent overstocking.";
    else suggestion = "Maintain current levels.";

    const explanation = `Total Sales: ${totalSales}\nAverage Sales: ${averageSales.toFixed(2)}\nGrowth Rate: ${(growthRate*100).toFixed(2)}%\nLast Quarter Avg: ${lastQuarterAvg.toFixed(2)}`;

    setForecast(forecastData);
    setAnalysis({
      totalSales,
      averageSales: averageSales.toFixed(2),
      growthRate: (growthRate*100).toFixed(2) + "%",
      lastQuarterAvg: lastQuarterAvg.toFixed(2)
    });
    setRecommendation(suggestion);
    setComputation(explanation);
  };

  // Save forecast
  const saveForecast = async () => {
    if (forecast.length === 0) return alert("Generate forecast first!");
    try {
      await axios.post(API_URL, { product, salesData, forecast, analysis, recommendation, computation });
      alert("Forecast saved successfully!");
      fetchForecasts();
    } catch (err) {
      console.error(err);
      alert("Failed to save forecast. Check console.");
    }
  };

  // Fetch saved forecasts
  const fetchForecasts = async () => {
    try {
      const res = await axios.get(API_URL);
      setSavedForecasts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete forecast
  const deleteForecast = async (id) => {
    if (!window.confirm("Delete this forecast?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchForecasts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div style={{ maxWidth:"850px", margin:"auto", padding:"25px", fontFamily:"Segoe UI" }}>
      <h2>📊 Demand Forecasting</h2>
      <input type="text" placeholder="Product name" value={product} onChange={e=>setProduct(e.target.value)} style={{width:"100%", padding:"6px", marginBottom:"10px"}} />

      <table border="1" cellPadding="5" style={{width:"100%", marginBottom:"10px"}}>
        <thead><tr><th>Month</th><th>Sales</th></tr></thead>
        <tbody>
          {salesData.map((row,i)=>(
            <tr key={i}>
              <td>
                <select value={row.month} onChange={e=>handleInputChange(i,"month",e.target.value)} style={{width:"95%"}}>
                  {monthsList.map((m,j)=><option key={j} value={m}>{m}</option>)}
                </select>
              </td>
              <td>
                <input type="number" value={row.sales} onChange={e=>handleInputChange(i,"sales",e.target.value)} style={{width:"90%"}}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginBottom:"10px"}}>
        <button onClick={addMonth}>➕ Add Month</button>
        <button onClick={removeMonth}>➖ Remove Month</button>
        <label style={{marginLeft:"10px"}}>Forecast Months: </label>
        <select value={forecastCount} onChange={e=>setForecastCount(parseInt(e.target.value))}>{Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}</option>)}</select>
      </div>

      <button onClick={analyzeAndForecast} style={{marginRight:"10px"}}>Analyze & Forecast</button>
      {forecast.length>0 && <button onClick={saveForecast}>💾 Save Forecast</button>}

      {forecast.length>0 && (
        <div style={{marginTop:"20px"}}>
          <h3>Forecast for {product}</h3>
          <table border="1" cellPadding="5" style={{width:"100%", marginBottom:"10px"}}>
            <thead><tr><th>Month</th><th>Forecast</th></tr></thead>
            <tbody>{forecast.map((f,i)=><tr key={i}><td>{f.month}</td><td>{f.value}</td></tr>)}</tbody>
          </table>
          <p><b>Recommendation:</b> {recommendation}</p>
          <pre>{computation}</pre>
        </div>
      )}

      <div style={{marginTop:"30px"}}>
        <h3>Saved Forecasts</h3>
        {savedForecasts.length===0 ? <p>No forecasts yet.</p> :
          <table border="1" cellPadding="5" style={{width:"100%"}}>
            <thead><tr><th>Product</th><th>Total</th><th>Avg</th><th>Growth</th><th>Action</th></tr></thead>
            <tbody>
              {savedForecasts.map(f=>
                <tr key={f._id}>
                  <td>{f.product}</td>
                  <td>{f.analysis?.totalSales}</td>
                  <td>{f.analysis?.averageSales}</td>
                  <td>{f.analysis?.growthRate}</td>
                  <td><button onClick={()=>deleteForecast(f._id)} style={{color:"red"}}>🗑️ Delete</button></td>
                </tr>
              )}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

export default DemandForecast;
