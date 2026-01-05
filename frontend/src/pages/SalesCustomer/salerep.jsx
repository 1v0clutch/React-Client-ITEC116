import { useState } from "react";

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
            <h2 className="text-3xl font-bold text-white tracking-tight">Sales Performance Reporting & Forecasting</h2>
            <p className="text-white/80 text-sm">Analyze Sales Data & Generate Revenue Forecasts</p>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Filter Sales Data</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Filter by Product
            </label>
            <select 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={filter.product} 
              onChange={e => setFilter({ ...filter, product: e.target.value })}
            >
              <option key="all-products" value="">All Products</option>
              <option key="product-a" value="Product A">Product A</option>
              <option key="product-b" value="Product B">Product B</option>
            </select>
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Filter by Region
            </label>
            <select 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={filter.region} 
              onChange={e => setFilter({ ...filter, region: e.target.value })}
            >
              <option key="all-regions" value="">All Regions</option>
              <option key="north" value="North">North</option>
              <option key="south" value="South">South</option>
              <option key="east" value="East">East</option>
              <option key="west" value="West">West</option>
            </select>
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Filter by Sales Rep
            </label>
            <select 
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={filter.rep} 
              onChange={e => setFilter({ ...filter, rep: e.target.value })}
            >
              <option key="all-reps" value="">All Sales Reps</option>
              <option key="alice" value="Alice">Alice</option>
              <option key="bob" value="Bob">Bob</option>
              <option key="charlie" value="Charlie">Charlie</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Sales Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sales Data</h3>
              <p className="text-white/80 text-sm">{filtered.length} records</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No sales data found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Region</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Sales Rep</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4 text-gray-600">{s.date}</td>
                      <td className="py-4 px-4 font-medium text-gray-800">{s.product}</td>
                      <td className="py-4 px-4 text-gray-600">{s.region}</td>
                      <td className="py-4 px-4 text-gray-600">{s.rep}</td>
                      <td className="py-4 px-4 font-semibold text-green-600">${s.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Summary Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Sales Summary & Forecast</h3>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800">Total Sales</h4>
            </div>
            <p className="text-3xl font-bold text-blue-600">${totalSales}</p>
            <p className="text-sm text-gray-600 mt-1">From {filtered.length} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800">Forecast Revenue</h4>
            </div>
            <p className="text-3xl font-bold text-green-600">${forecastRevenue}</p>
            <p className="text-sm text-gray-600 mt-1">30-day projection</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800">Avg Per Day</h4>
            </div>
            <p className="text-3xl font-bold text-purple-600">${Math.round(avgPerDay)}</p>
            <p className="text-sm text-gray-600 mt-1">Daily average</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800">Active Reps</h4>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{Object.keys(salesByRep).length}</p>
            <p className="text-sm text-gray-600 mt-1">Sales representatives</p>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Sales by Product
            </h4>
            <div className="space-y-3">
              {Object.entries(salesByProduct).map(([product, amount]) => (
                <div key={product} className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{product}</span>
                  <span className="font-bold text-blue-600">${amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-green-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Sales by Region
            </h4>
            <div className="space-y-3">
              {Object.entries(salesByRegion).map(([region, amount]) => (
                <div key={region} className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{region}</span>
                  <span className="font-bold text-green-600">${amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-purple-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sales by Rep
            </h4>
            <div className="space-y-3">
              {Object.entries(salesByRep).map(([rep, amount]) => (
                <div key={rep} className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">{rep}</span>
                  <span className="font-bold text-purple-600">${amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesReport;