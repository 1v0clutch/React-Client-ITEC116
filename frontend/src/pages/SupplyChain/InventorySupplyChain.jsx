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
        demand: w.demand || 0,
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
      return alert("Fill name and location.");
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

  // Get available stock of an item in a warehouse
  const getAvailableStock = () => {
    if (!transferData.from || !transferData.itemId) return 0;
    const source = warehouses.find((w) => w._id === transferData.from);
    if (!source) return 0;
    const item = source.items.find(
      (i) => (i.itemId?._id || i._id) === transferData.itemId
    );
    return item ? item.quantity : 0;
  };

  // Transfer stock
  const transferStock = async () => {
    const { from, to, itemId, quantity } = transferData;
    const qty = Number(quantity);

    if (!from || !to || !itemId || !qty || from === to) {
      return alert("Select valid warehouses, item, and quantity");
    }

    const availableStock = getAvailableStock();

    if (qty > availableStock) {
      return alert(
        `Not enough stock in source warehouse. Available: ${availableStock}`
      );
    }

    try {
      await axios.post("http://localhost:8000/api/warehouses/transferItem", {
        fromWarehouseId: from,
        toWarehouseId: to,
        itemId,
        quantity: qty,
      });
      setTransferData({ from: "", to: "", itemId: "", quantity: 0 });
      fetchWarehouses();
      alert("Stock transferred!");
    } catch (err) {
      alert(err.response?.data?.error || "Transfer failed");
    }
  };

  // Allocate inventory proportionally to demand
  const allocateInventory = async () => {
    const totalDemand = warehouses.reduce((sum, w) => sum + (w.demand || 0), 0);
    if (totalDemand === 0) return alert("No demand to allocate");

    try {
      for (const w of warehouses) {
        for (const item of w.items) {
          const allocation = Math.round(
            ((w.demand || 0) / totalDemand) * item.quantity
          );
          await axios.post(
            "http://localhost:8000/api/warehouses/allocateItem",
            {
              warehouseId: w._id,
              itemId: item.itemId?._id || item._id,
              quantity: allocation,
            }
          );
        }
      }
      fetchWarehouses();
      alert("Inventory allocated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Allocation failed");
    }
  };

  // Calculate total cost
  const totalCost = () => {
    const transportCost = warehouses.length * 150;
    const holdingCost = warehouses.reduce(
      (sum, w) => sum + w.items.reduce((s, i) => s + i.quantity * 0.5, 0),
      0
    );
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
                    {(i.itemId?.name || "Unknown")} (Qty: {i.quantity})
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
        onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
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
            setTransferData({ ...transferData, itemId: e.target.value, quantity: 0 })
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

      {transferData.itemId && (
        <p>
          Available Stock: <strong>{getAvailableStock()}</strong>
        </p>
      )}

      <input
        type="number"
        placeholder="Quantity"
        value={transferData.quantity}
        min={1}
        max={getAvailableStock()}
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val > getAvailableStock()) {
            alert(`Cannot exceed available stock: ${getAvailableStock()}`);
            return;
          }
          setTransferData({ ...transferData, quantity: val });
        }}
      />

      <button onClick={transferStock}>Transfer</button>

      <h3>📊 Cost Overview</h3>
      <p>
        Transportation + Holding Cost: <strong>₱{totalCost().toFixed(2)}</strong>
      </p>

      <h3>📈 Allocate Inventory to Demand</h3>
      <button onClick={allocateInventory}>Allocate</button>
    </div>
  );
}

export default InventoryDistribution;
