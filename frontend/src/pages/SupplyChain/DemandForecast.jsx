import React, { useState, useEffect } from "react";
import axios from "axios";

function DemandForecast() {
  const monthsList = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const [product, setProduct] = useState("");
  const [salesData, setSalesData] = useState([{ month: "January", sales: "" }]);
  const [forecastCount, setForecastCount] = useState(3);
  const [forecast, setForecast] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [recommendation, setRecommendation] = useState("");
  const [computation, setComputation] = useState("");
  const [savedForecasts, setSavedForecasts] = useState([]);

  const API_URL = "http://localhost:8000/api/demandForecast";

  // ➕ Add month
  const addMonth = () => {
    if (salesData.length < 12)
      setSalesData([...salesData, { month: "January", sales: "" }]);
  };

  // ➖ Remove month
  const removeMonth = () => {
    if (salesData.length > 1) setSalesData(salesData.slice(0, -1));
  };

  // 🔁 Handle input
  const handleInputChange = (index, key, value) => {
    const newData = [...salesData];
    newData[index][key] =
      key === "sales" ? (value === "" ? "" : parseFloat(value)) : value;
    setSalesData(newData);
  };

  // 🧮 Forecast computation + auto-save
  const analyzeAndForecast = async () => {
    const validSales = salesData
      .map((d) => d.sales)
      .filter((x) => !isNaN(x) && x > 0);

    if (!product.trim()) return alert("Enter product name");
    if (validSales.length < 3)
      return alert("Enter at least 3 months of valid sales data");

    const totalSales = validSales.reduce((a, b) => a + b, 0);
    const averageSales = totalSales / validSales.length;
    const growthRate =
      (validSales[validSales.length - 1] - validSales[0]) / validSales[0];
    const lastQuarterAvg =
      validSales.slice(-3).reduce((a, b) => a + b, 0) / 3;

    const seasonalFactor = [1.05, 1.08, 1.10, 1.12, 1.06, 1.09];
    const forecastData = [];

    for (let i = 0; i < forecastCount; i++) {
      const factor = seasonalFactor[i % seasonalFactor.length];
      const value = Math.round(
        lastQuarterAvg * (1 + growthRate / 12) * factor
      );
      forecastData.push({ month: `Month ${i + 1}`, value });
    }

    const nextDemand = forecastData[forecastData.length - 1].value;
    let suggestion = "";
    if (nextDemand > averageSales * 1.15)
      suggestion = "Increase production and procurement.";
    else if (nextDemand < averageSales * 0.85)
      suggestion = "Reduce procurement to prevent overstocking.";
    else suggestion = "Maintain current levels.";

    const explanation = `Total Sales: ${totalSales}
Average Sales: ${averageSales.toFixed(2)}
Growth Rate: ${(growthRate * 100).toFixed(2)}%
Last Quarter Avg: ${lastQuarterAvg.toFixed(2)}`;

    const newAnalysis = {
      totalSales,
      averageSales: averageSales.toFixed(2),
      growthRate: (growthRate * 100).toFixed(2) + "%",
      lastQuarterAvg: lastQuarterAvg.toFixed(2),
    };

    setForecast(forecastData);
    setAnalysis(newAnalysis);
    setRecommendation(suggestion);
    setComputation(explanation);

    // ✅ Auto-save after generating
    try {
      await axios.post(API_URL, {
        product,
        salesData,
        forecast: forecastData,
        analysis: newAnalysis,
        recommendation: suggestion,
        computation: explanation,
      });
      alert("Forecast automatically saved!");
      fetchForecasts();
    } catch (err) {
      console.error("Auto-save failed:", err);
      alert("❌ Failed to save forecast. Check backend connection.");
    }
  };

  // 🗂️ Fetch all saved forecasts
  const fetchForecasts = async () => {
    try {
      const res = await axios.get(API_URL);
      setSavedForecasts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // ❌ Delete forecast
  const deleteForecast = async (id) => {
    if (!window.confirm("Delete this forecast?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchForecasts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Demand Forecasting</h2>
            <p className="text-white/80 text-sm">Analyze sales data and predict future demand patterns</p>
          </div>
        </div>
      </div>

      {/* Enhanced Product Input */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Product Information</h3>
        </div>
        
        <div className="flex flex-col group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Enhanced Sales Data Table */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Historical Sales Data</h3>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Month</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <td className="py-4 px-4">
                    <select
                      value={row.month}
                      onChange={(e) => handleInputChange(i, "month", e.target.value)}
                      className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white w-full"
                    >
                      {monthsList.map((m, j) => (
                        <option key={j} value={m}>{m}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      value={row.sales}
                      onChange={(e) => handleInputChange(i, "sales", e.target.value)}
                      className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white w-full"
                      placeholder="Enter sales amount"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button 
              onClick={addMonth}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Month
            </button>
            <button 
              onClick={removeMonth}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Remove Month
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
              </svg>
              Forecast Months:
            </label>
            <select
              value={forecastCount}
              onChange={(e) => setForecastCount(parseInt(e.target.value))}
              className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={analyzeAndForecast}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analyze & Forecast (Auto Save)
          </button>
        </div>
      </div>

      {/* Enhanced Forecast Results */}
      {forecast.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Forecast Results for {product}</h3>
          </div>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Month</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Forecast</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((f, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-4 px-4 font-medium text-gray-800">{f.month}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
                        {f.value.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800">Recommendation</h4>
                <p className="text-blue-700 font-medium">{recommendation}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-700 mb-2">Analysis Details:</h5>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">{computation}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Saved Forecasts */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Saved Forecasts</h3>
              <p className="text-white/80 text-sm">{savedForecasts.length} forecasts saved</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {savedForecasts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No forecasts yet</p>
              <p className="text-gray-400 mt-2">Create your first forecast above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Total Sales</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Average</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Growth Rate</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedForecasts.map((f) => (
                    <tr key={f._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4 font-medium text-gray-800">{f.product}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                          {f.analysis?.totalSales?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                          {f.analysis?.averageSales}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-medium">
                          {f.analysis?.growthRate}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button 
                          onClick={() => deleteForecast(f._id)}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DemandForecast;
