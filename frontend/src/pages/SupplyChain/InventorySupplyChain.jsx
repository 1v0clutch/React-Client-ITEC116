import React, { useState, useEffect } from "react";
import axios from "axios";

function InventoryDistribution() {
  const [warehouses, setWarehouses] = useState([]);
  const [transferData, setTransferData] = useState({
    from: "",
    to: "",
    itemId: "",
    quantity: 0,
  });
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/warehouses/getAllWarehouse"
      );

      const mapped = res.data.map((w, index) => ({
        id: index + 1,
        _id: w._id,
        name: w.name,
        location: w.location,
        stock: w.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
        items: w.items || [],
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
      await axios.post(
        "http://localhost:8000/api/warehouses/addWarehouse",
        newWarehouse
      );
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
      stock: Math.round(((w.demand || 0) / totalDemand) * totalStock),
    }));

    setWarehouses(updated);
    alert("Inventory allocated to demand areas.");
  };

  // Transfer stock
  const transferStock = async () => {
    const { from, to, itemId, quantity } = transferData;
    console.log("Transfer Data:", { from, to, itemId, quantity });

    if (!from || !to || !itemId || !quantity || from === to) {
      return alert("Select valid warehouses, item, and quantity");
    }

    try {
      await axios.post("http://localhost:8000/api/warehouses/transferItem", {
        fromWarehouseId: from,
        toWarehouseId: to,
        itemId,
        quantity: Number(quantity),
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
    <div>
      <h2>🏬 Inventory Distribution & Warehouse Coordination</h2>

      <h3>📦 Warehouses</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Stock</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((w) => (
            <tr key={w._id}>
              <td>{w.id}</td>
              <td>{w.name}</td>
              <td>{w.location}</td>
              <td>{w.stock}</td>
              <td>
                {w.items.filter(i => i.itemId).map((i) => (
                  <div key={i._id}>
                    {(i.itemId?.name || "Unknown Item")} (Qty: {i.quantity})
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>➕ Add Warehouse</h3>
      <input
        placeholder="Name"
        value={newWarehouse.name}
        onChange={(e) =>
          setNewWarehouse({ ...newWarehouse, name: e.target.value })
        }
      />
      <input
        placeholder="Location"
        value={newWarehouse.location}
        onChange={(e) =>
          setNewWarehouse({ ...newWarehouse, location: e.target.value })
        }
      />
      <button onClick={addWarehouse}>Add</button>

      <h3>🚚 Transfer Stock</h3>
      <select
        value={transferData.from}
        onChange={(e) =>
          setTransferData({ from: e.target.value, to: "", itemId: "", quantity: 0 })
        }
      >
        <option value="">From Warehouse</option>
        {warehouses.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      <select
        value={transferData.to}
        onChange={(e) =>
          setTransferData({ ...transferData, to: e.target.value })
        }
      >
        <option value="">To Warehouse</option>
        {warehouses.map((w) => (
          <option key={w._id} value={w._id}>
            {w.name}
          </option>
        ))}
      </select>

      {transferData.from && (
        <select
          value={transferData.itemId}
          onChange={(e) =>
            setTransferData({ ...transferData, itemId: e.target.value })
          }
        >
          <option value="">Select Item</option>
          {warehouses
            .find((w) => w._id === transferData.from)
            ?.items
            .filter((i) => i.itemId)
            .map((i) => (
              <option key={i._id} value={i.itemId._id}>
                {i.itemId.name} (Qty: {i.quantity})
              </option>
            ))}
        </select>
      )}

      <input
        type="number"
        placeholder="Quantity"
        value={transferData.quantity}
        onChange={(e) =>
          setTransferData({ ...transferData, quantity: Number(e.target.value) })
        }
      />

      <button onClick={transferStock}>Transfer</button>

      <h3>📊 Cost Overview</h3>
      <p>
        Transportation + Holding Cost:{" "}
        <strong>₱{totalCost().toFixed(2)}</strong>
      </p>

      <h3>📈 Allocate Inventory to Demand</h3>
      <button onClick={allocateInventory}>Allocate</button>
    </div>
  );
}

export default InventoryDistribution;
