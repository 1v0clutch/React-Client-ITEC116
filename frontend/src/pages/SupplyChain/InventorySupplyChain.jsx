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
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-800 mb-2">🏬 Inventory Distribution & Warehouse Coordination</h2>
          <p className="text-indigo-600">Manage warehouse inventory and coordinate stock transfers</p>
        </div>

        {/* Warehouses Table */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-200">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">📦 Warehouses</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Location</th>
                  <th className="px-6 py-4 text-left font-semibold">Total Stock</th>
                  <th className="px-6 py-4 text-left font-semibold">Items</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w._id} className="border-b border-indigo-200 hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-gray-900 font-medium">{w.id}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{w.name}</td>
                    <td className="px-6 py-4 text-gray-700">{w.location}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{w.stock}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {w.items.map((i) => (
                          <div key={i._id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                            <span className="font-medium">{i.itemId?.name || 'Unknown Item'}</span>
                            <span className="text-gray-600 ml-2">(Qty: {i.quantity})</span>
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

        {/* Add Warehouse Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-200">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">➕ Add Warehouse</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Name</label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-600 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="Enter warehouse name"
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-600 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="Enter warehouse location"
                value={newWarehouse.location}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
              />
            </div>
          </div>
          
          <button 
            onClick={addWarehouse}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Add Warehouse
          </button>
        </div>

        {/* Transfer Stock Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-indigo-200">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">🚚 Transfer Stock</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Warehouse</label>
              <select 
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                value={transferData.from} 
                onChange={(e) => setTransferData({ ...transferData, from: e.target.value })}
              >
                <option value="">Select source warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Warehouse</label>
              <select 
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 focus:border-indigo-500 focus:bg-white transition-all duration-200"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 focus:border-indigo-500 focus:bg-white transition-all duration-200"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-600 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                placeholder="Enter quantity"
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
              />
            </div>
          </div>
          
          <button 
            onClick={transferStock}
            className="mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Transfer Stock
          </button>
        </div>

        {/* Cost Overview and Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cost Overview */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-200">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">📊 Cost Overview</h3>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
              <p className="text-lg text-gray-700">Transportation + Holding Cost:</p>
              <p className="text-3xl font-bold text-green-700">₱{totalCost().toFixed(2)}</p>
            </div>
          </div>

          {/* Allocate Inventory */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-indigo-200">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">📈 Allocate Inventory to Demand</h3>
            <p className="text-gray-600 mb-4">Automatically distribute inventory based on demand patterns</p>
            <button 
              onClick={allocateInventory}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Allocate Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default InventoryDistribution;
