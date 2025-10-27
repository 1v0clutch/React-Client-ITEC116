import React, { useState, useEffect } from "react";
import axios from "axios";

function InventoryDistribution() {
  const [warehouses, setWarehouses] = useState([]);
  const [transferData, setTransferData] = useState({ from: "", to: "", quantity: "" });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", stock: 0, demand: 0 });
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ name: "", stock: 0, demand: 0 });

  // Fetch warehouses from backend
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get("/api/warehouses/getAllWarehouse");
      // Map data to match frontend structure
      const mapped = res.data.map((w, index) => ({
        id: index + 1,
        _id: w._id,
        name: w.name,
        stock: w.items.reduce((sum, i) => sum + i.quantity, 0),
        demand: w.demand || 0, // optional demand field
      }));
      setWarehouses(mapped);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch warehouses");
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const formatPeso = (value) =>
    value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

  const calculateTotalCost = () => {
    const transportCost = warehouses.length * 150;
    const holdingCost = warehouses.reduce((sum, w) => sum + w.stock * 0.5, 0);
    return transportCost + holdingCost;
  };

  // Add warehouse via API
  const addWarehouse = async () => {
    const { name, stock, demand } = newWarehouse;
    if (!name || !stock || !demand) {
      alert("⚠️ Please fill out all fields before adding a warehouse.");
      return;
    }

    try {
      const res = await axios.post("/api/warehouses/addWarehouse", {
        name,
        stock: Number(stock),
        demand: Number(demand),
      });
      alert(res.data.message);
      setNewWarehouse({ name: "", stock: 0, demand: 0 });
      fetchWarehouses();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to add warehouse");
    }
  };

  // Start editing
  const startEdit = (w) => {
    setEditing(w._id);
    setEditData({ name: w.name, stock: w.stock, demand: w.demand });
  };

  // Save edit locally (or you can add backend update API)
  const saveEdit = async (w) => {
    try {
      // You can create an updateWarehouse API if needed
      // For now, just update locally
      setWarehouses((prev) =>
        prev.map((wh) =>
          wh._id === w._id
            ? { ...wh, name: editData.name, stock: Number(editData.stock), demand: Number(editData.demand) }
            : wh
        )
      );
      setEditing(null);
      alert("✏️ Warehouse updated successfully!");
    } catch (error) {
      alert("Failed to update warehouse");
    }
  };

  // Transfer stock via API
  const transferStock = async () => {
    const { from, to, quantity } = transferData;
    const qty = Number(quantity);
    if (!from || !to || !qty || from === to) {
      alert("⚠️ Please select valid warehouses and quantity.");
      return;
    }

    try {
      await axios.post("/api/warehouses/transferItem", {
        fromWarehouseId: from,
        toWarehouseId: to,
        itemId: null, // you may modify to select a default item for this example
        quantity: qty,
      });
      alert(`🔄 Transferred ${qty} units from ${from} to ${to}`);
      setTransferData({ from: "", to: "", quantity: "" });
      fetchWarehouses();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to transfer stock");
    }
  };

  // Allocate inventory locally (you can also make an API for this)
  const allocateToDemand = () => {
    const totalStock = warehouses.reduce((sum, w) => sum + w.stock, 0);
    const totalDemand = warehouses.reduce((sum, w) => sum + w.demand, 0);

    if (totalDemand === 0) {
      alert("⚠️ Cannot allocate — total demand is zero.");
      return;
    }

    const updated = warehouses.map((w) => {
      const share = Math.round((w.demand / totalDemand) * totalStock);
      return { ...w, stock: share };
    });

    setWarehouses(updated);
    alert("✅ Inventory reallocated based on demand levels.");
  };

  return (
    <div>
      <h2>🏬 Inventory Distribution & Warehouse Coordination</h2>

      <h3>📦 Warehouse Records</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Warehouse</th>
            <th>Stock</th>
            <th>Demand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w._id}>
              <td>{w.id}</td>
              <td>
                {editing === w._id ? (
                  <input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  w.name
                )}
              </td>
              <td>
                {editing === w._id ? (
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                  />
                ) : (
                  w.stock
                )}
              </td>
              <td>
                {editing === w._id ? (
                  <input
                    type="number"
                    value={editData.demand}
                    onChange={(e) => setEditData({ ...editData, demand: e.target.value })}
                  />
                ) : (
                  w.demand
                )}
              </td>
              <td>
                {editing === w._id ? (
                  <button onClick={() => saveEdit(w)}>Save</button>
                ) : (
                  <button onClick={() => startEdit(w)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>➕ Add Warehouse</h3>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={newWarehouse.name}
          onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={newWarehouse.stock}
          onChange={(e) => setNewWarehouse({ ...newWarehouse, stock: e.target.value })}
        />
        <input
          type="number"
          placeholder="Demand"
          value={newWarehouse.demand}
          onChange={(e) => setNewWarehouse({ ...newWarehouse, demand: e.target.value })}
        />
        <button onClick={addWarehouse}>Add</button>
      </div>

      <h3>🚚 Inter-Warehouse Transfer</h3>
      <div>
        <label>From: </label>
        <select
          value={transferData.from}
          onChange={(e) => setTransferData({ ...transferData, from: e.target.value })}
        >
          <option value="">Select</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        <label> To: </label>
        <select
          value={transferData.to}
          onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
        >
          <option value="">Select</option>
          {warehouses.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>

        <label> Quantity: </label>
        <input
          type="number"
          value={transferData.quantity}
          onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
        />
        <button onClick={transferStock}>Transfer</button>
      </div>

      <br />
      <button onClick={allocateToDemand}>Allocate to High-Demand Areas</button>

      <h3>💰 Cost Overview</h3>
      <p>
        Estimated Transportation + Holding Cost: <strong>{formatPeso(calculateTotalCost())}</strong>
      </p>
    </div>
  );
}

export default InventoryDistribution;
