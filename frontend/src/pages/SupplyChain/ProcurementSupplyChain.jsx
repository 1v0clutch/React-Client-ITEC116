import React, { useState, useEffect } from "react";
import axios from "axios";

function Procurement() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({ stock: "", threshold: "" });
  const [log, setLog] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showEvaluation, setShowEvaluation] = useState(false); // toggle evaluation panel

  const SUPPLIER_API = "http://localhost:8000/api/suppliers";

  const logMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(SUPPLIER_API);
        setSuppliers(Array.isArray(res.data) ? res.data.map(s => ({ ...s, showEval: false })) : []);
        logMessage("✅ Supplier data synced successfully.");
      } catch (err) {
        logMessage("❌ Failed to fetch suppliers.");
        console.error(err);
      }
    };
    fetchSuppliers();
  }, []);

  const placeOrder = () => {
    if (!selectedSupplier) {
      logMessage("⚠️ Please select a supplier first.");
      return;
    }
    const supplier = suppliers.find((s) => s._id === selectedSupplier);
    const order = {
      id: Date.now(),
      supplier: supplier.name,
      deliveryTime: Math.floor(Math.random() * 5) + 2,
      status: "Processing",
    };
    setOrders((prev) => [...prev, order]);
    logMessage(`📦 Order placed with ${supplier.name}.`);

    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Delivery received from ${supplier.name}.`);
    }, 3000);
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const checkInventory = () => {
    const stock = Number(inventory.stock);
    const threshold = Number(inventory.threshold);

    if (isNaN(stock) || isNaN(threshold)) {
      logMessage("⚠️ Invalid stock or threshold value.");
      return;
    }

    if (stock < threshold) {
      logMessage(`⚠️ Stock below threshold (${stock} < ${threshold}). Auto-ordering...`);
      autoOrder();
    } else {
      logMessage(`✅ Stock sufficient (${stock} ≥ ${threshold}).`);
    }
  };

  const autoOrder = () => {
    if (suppliers.length === 0) {
      logMessage("❌ No suppliers available for automatic order.");
      return;
    }
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const order = {
      id: Date.now(),
      supplier: randomSupplier.name,
      deliveryTime: Math.floor(Math.random() * 5) + 2,
      status: "Processing",
    };
    setOrders((prev) => [...prev, order]);
    logMessage(`🤝 Automatically ordered from ${randomSupplier.name}.`);

    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Auto-delivery received from ${randomSupplier.name}.`);
    }, 3000);
  };

  const evaluateSupplier = (id) => {
    const supplier = suppliers.find((s) => s._id === id);
    if (!supplier.evaluation || Object.keys(supplier.evaluation).length < 3) {
      alert("Please rate all criteria before submitting.");
      return;
    }
    setSuppliers((prev) =>
      prev.map((s) => (s._id === id ? { ...s, evaluated: true, showEval: false } : s))
    );
    const score = (
      Object.values(supplier.evaluation).reduce((a, b) => a + b, 0) / 3
    ).toFixed(1);
    logMessage(`📊 Supplier ${supplier.name} evaluated with score ${score}`);
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find((s) => s._id === id);
    if (window.confirm(`Delete supplier ${supplier.name}?`)) {
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
      logMessage(`❌ Supplier ${supplier.name} deleted.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8m-4-7v3m-4 4h8" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Procurement & Supplier Coordination</h2>
            <p className="text-white/80 text-sm">Manage suppliers, monitor inventory, and coordinate procurement activities</p>
          </div>
        </div>
      </div>

      {/* Enhanced Top Section: Supplier + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enhanced Supplier Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Supplier Selection</h3>
              <p className="text-sm text-gray-600">Select a supplier to place manual orders</p>
            </div>
          </div>
          
          {suppliers.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Choose Supplier
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white w-full"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={placeOrder}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" />
                  </svg>
                  Place Order
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-lg font-semibold text-gray-500">No suppliers available</p>
                <p className="text-gray-400 mt-2">Add some suppliers in Module 3</p>
              </div>
            )}
        </div>

        {/* Enhanced Inventory Monitoring */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Inventory Monitoring</h3>
              <p className="text-sm text-gray-600">Monitor stock levels and auto-trigger orders</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Current Stock
              </label>
              <input
                type="number"
                placeholder="Enter current stock"
                value={inventory.stock}
                onChange={(e) => setInventory({ ...inventory, stock: e.target.value })}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Threshold
              </label>
              <input
                type="number"
                placeholder="Enter threshold"
                value={inventory.threshold}
                onChange={(e) => setInventory({ ...inventory, threshold: e.target.value })}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 group-hover:border-orange-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
          
          <button
            onClick={checkInventory}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 w-full justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Check & Auto-Order
          </button>
        </div>
      </div>

      {/* Enhanced Active Orders */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Active Orders</h3>
            <p className="text-sm text-gray-600">Track all current orders and their status</p>
          </div>
        </div>
        
        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Supplier
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Delivery Time (days)
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-orange-50 transition-colors duration-200">
                    <td className="py-4 px-4 font-medium text-gray-800">{o.supplier}</td>
                    <td className="py-4 px-4 text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {o.deliveryTime} days
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        o.status === "Delivered" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-lg font-semibold text-gray-500">No active orders yet</p>
            <p className="text-gray-400 mt-2">Place your first order above</p>
          </div>
        )}
      </div>

      {/* Enhanced Supplier Evaluation Toggle */}
      <div className="mb-8">
        <button
          onClick={() => setShowEvaluation(!showEvaluation)}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showEvaluation ? "Hide Supplier Evaluation" : "Show Supplier Evaluation"}
        </button>
      </div>

      {/* Enhanced Supplier Evaluation Cards */}
      {showEvaluation && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-yellow-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Supplier Evaluation</h3>
              <p className="text-sm text-gray-600">Rate and evaluate supplier performance</p>
            </div>
          </div>
          
          {suppliers.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((s) => (
                <div key={s._id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:border-yellow-300 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">{s.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      s.evaluated 
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {s.evaluated ? "✅ Evaluated" : "⏳ Pending"}
                    </span>
                  </div>

                  {!s.evaluated && (
                    <button
                      onClick={() => setSuppliers(prev => prev.map(sup =>
                        sup._id === s._id ? { ...sup, showEval: !sup.showEval } : sup
                      ))}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 mb-4 w-full"
                    >
                      {s.showEval ? "Hide Evaluation" : "Evaluate"}
                    </button>
                  )}

                  {s.showEval && !s.evaluated && (
                    <div className="space-y-4">
                      {["Delivery Timeliness", "Product Quality", "Communication"].map((crit) => (
                        <div key={crit} className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700">{crit}</label>
                          <select
                            value={s.evaluation?.[crit] ?? ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setSuppliers(prev => prev.map(sup =>
                                sup._id === s._id
                                  ? { ...sup, evaluation: { ...sup.evaluation, [crit]: val } }
                                  : sup
                              ));
                            }}
                            className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                          >
                            <option value="">Select rating</option>
                            {[1,2,3,4,5].map((n) => (
                              <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      {s.evaluation && Object.keys(s.evaluation).length === 3 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm font-bold text-blue-800">
                            Overall Score: {(Object.values(s.evaluation).reduce((a,b)=>a+b,0)/3).toFixed(1)}/5
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => evaluateSupplier(s._id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => deleteSupplier(s._id)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-semibold text-gray-500">No suppliers to evaluate</p>
              <p className="text-gray-400 mt-2">Add suppliers in Module 3 to start evaluating</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Activity Log */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Activity Log</h3>
            <p className="text-sm text-gray-600">All procurement activities are logged here</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 max-h-80 overflow-y-auto border-2 border-gray-200">
          {log.length ? (
            <div className="space-y-3">
              {log.map((entry, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-purple-300 transition-all duration-200">
                  <p className="text-gray-700 font-medium">{entry}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No activity yet</p>
              <p className="text-gray-400 text-sm mt-1">Start placing orders to see activity logs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Procurement;
