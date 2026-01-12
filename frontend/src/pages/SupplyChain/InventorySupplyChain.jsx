import React, { useState, useEffect } from "react";
import axios from "axios";

function InventoryDistribution() {
  const [warehouses, setWarehouses] = useState([]);
  const [transferData, setTransferData] = useState({ from: "", to: "", itemId: "", quantity: 0 });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/warehouses/getAllWarehouse");
      const mapped = res.data.map((w, index) => ({
        id: index + 1,
        _id: w._id,
        name: w.name,
        location: w.location,
        stock: w.items.reduce((sum, i) => sum + i.quantity, 0),
        items: w.items
      }));
      setWarehouses(mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch warehouses. Check backend.");
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Add warehouse
  const addWarehouse = async () => {
    if (!newWarehouse.name || !newWarehouse.location) {
      alert("Fill name and location.");
      return;
    }
    try {
      await axios.post("http://localhost:8000/api/warehouses/addWarehouse", newWarehouse);
      setNewWarehouse({ name: "", location: "" });
      fetchWarehouses();
      alert("Warehouse added!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add warehouse");
    }
  };

  // Allocate inventory to demand
  const allocateInventory = () => {
    const totalStock = warehouses.reduce((sum, w) => sum + w.stock, 0);
    const totalDemand = warehouses.reduce((sum, w) => sum + (w.demand || 0), 0);
    if (totalDemand === 0) return alert("Cannot allocate: total demand = 0");

    const updated = warehouses.map((w) => ({
      ...w,
      stock: Math.round((w.demand || 0) / totalDemand * totalStock)
    }));
    setWarehouses(updated);
    alert("Inventory allocated to demand areas.");
  };

  // Transfer stock
  const transferStock = async () => {
    const { from, to, itemId, quantity } = transferData;
    if (!from || !to || !itemId || !quantity || from === to)
      return alert("Select valid warehouses, item, and quantity");

    try {
      await axios.post("http://localhost:8000/api/warehouses/transferItem", {
        fromWarehouseId: from,
        toWarehouseId: to,
        itemId,
        quantity: Number(quantity)
      });
      setTransferData({ from: "", to: "", itemId: "", quantity: 0 });
      fetchWarehouses();
      alert("Stock transferred!");
    } catch (err) {
      alert(err.response?.data?.error || "Transfer failed");
    }
  };

  // Cost calculation
  const totalCost = () => {
    const transportCost = warehouses.length * 150;
    const holdingCost = warehouses.reduce((sum, w) => sum + w.stock * 0.5, 0);
    return transportCost + holdingCost;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Inventory Distribution & Warehouse Coordination</h2>
            <p className="text-white/80 text-sm">Manage warehouse inventory and coordinate stock transfers</p>
          </div>
        </div>
      </div>

        {/* Enhanced Warehouses Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Warehouses</h3>
              <p className="text-sm text-gray-600">Overview of all warehouse locations and inventory</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      ID
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Name
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Total Stock
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Items
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        #{w.id}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">{w.name}</td>
                    <td className="py-4 px-4 text-gray-600">{w.location}</td>
                    <td className="py-4 px-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {w.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        {w.items.map((i) => (
                          <div key={i._id} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 px-3 py-2 rounded-lg">
                            <span className="font-medium text-gray-800">{i.itemId?.name || 'Unknown Item'}</span>
                            <span className="text-orange-600 ml-2 font-semibold">(Qty: {i.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Add Warehouse Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Add Warehouse</h3>
              <p className="text-sm text-gray-600">Create a new warehouse location</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Warehouse Name
              </label>
              <input
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter warehouse name"
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
              />
            </div>
            
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <input
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 group-hover:border-emerald-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter warehouse location"
                value={newWarehouse.location}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={addWarehouse}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Warehouse
            </button>
          </div>
        </div>

        {/* Enhanced Transfer Stock Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Transfer Stock</h3>
              <p className="text-sm text-gray-600">Move inventory between warehouse locations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                From Warehouse
              </label>
              <select 
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                value={transferData.from} 
                onChange={(e) => setTransferData({ ...transferData, from: e.target.value })}
              >
                <option value="">Select source warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                To Warehouse
              </label>
              <select 
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                value={transferData.to} 
                onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
              >
                <option value="">Select destination warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            {transferData.from && (
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Select Item
                </label>
                <select 
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={transferData.itemId} 
                  onChange={(e) => setTransferData({ ...transferData, itemId: e.target.value })}
                >
                  <option value="">Choose item to transfer</option>
                  {warehouses.find(w => w._id === transferData.from)?.items.map(i => (
                    <option key={i._id} value={i.itemId._id}>
                      {i.itemId.name} (Available: {i.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Quantity
              </label>
              <input
                type="number"
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter quantity"
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={transferStock}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Transfer Stock
            </button>
          </div>
        </div>

        {/* Enhanced Cost Overview and Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enhanced Cost Overview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Cost Overview</h3>
                <p className="text-sm text-gray-600">Transportation and holding costs</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-6 rounded-xl">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Cost:</p>
                  <p className="text-2xl font-bold text-green-700">₱{totalCost().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Allocate Inventory */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Allocate Inventory to Demand</h3>
                <p className="text-sm text-gray-600">Automatically distribute inventory based on demand patterns</p>
              </div>
            </div>
            
            <button 
              onClick={allocateInventory}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Allocate Inventory
            </button>
          </div>
        </div>
      </div>
  );
}

export default InventoryDistribution;
