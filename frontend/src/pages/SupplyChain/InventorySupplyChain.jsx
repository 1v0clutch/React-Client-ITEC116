import React, { useState } from "react";

function InventoryDistribution() {
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Warehouse A", stock: 120, demand: 60 },
    { id: 2, name: "Warehouse B", stock: 80, demand: 100 },
    { id: 3, name: "Warehouse C", stock: 50, demand: 40 },
  ]);

  const [transferData, setTransferData] = useState({
    from: "",
    to: "",
    quantity: "",
  });

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    stock: "",
    demand: "",
  });

  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    stock: "",
    demand: "",
  });

  // Format cost in Philippine Peso
  const formatPeso = (value) =>
    value.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

  // Calculate estimated total cost (Transportation + Holding)
  const calculateTotalCost = () => {
    const transportCost = warehouses.length * 150;
    const holdingCost = warehouses.reduce((sum, w) => sum + w.stock * 0.5, 0);
    return transportCost + holdingCost;
  };

  // ✅ Add new warehouse
  const addWarehouse = () => {
    const { name, stock, demand } = newWarehouse;
    if (!name || !stock || !demand) {
      alert("⚠️ Please fill out all fields before adding a warehouse.");
      return;
    }

    const newW = {
      id: warehouses.length + 1,
      name,
      stock: parseInt(stock),
      demand: parseInt(demand),
    };

    setWarehouses([...warehouses, newW]);
    setNewWarehouse({ name: "", stock: "", demand: "" });
    alert(`✅ Warehouse "${name}" added successfully.`);
  };

  // ✅ Start editing warehouse
  const startEdit = (id) => {
    const wh = warehouses.find((w) => w.id === id);
    if (!wh) return;
    setEditing(id);
    setEditData({ name: wh.name, stock: wh.stock, demand: wh.demand });
  };

  // ✅ Save edited warehouse
  const saveEdit = (id) => {
    setWarehouses((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              name: editData.name,
              stock: parseInt(editData.stock),
              demand: parseInt(editData.demand),
            }
          : w
      )
    );
    setEditing(null);
    alert("✏️ Warehouse updated successfully!");
  };

  // ✅ Transfer stock (with validation)
  const transferStock = () => {
    const { from, to, quantity } = transferData;
    const qty = parseInt(quantity);

    if (!from || !to || !qty || from === to) {
      alert("⚠️ Please select valid warehouses and quantity.");
      return;
    }

    const fromWarehouse = warehouses.find((w) => w.name === from);
    const toWarehouse = warehouses.find((w) => w.name === to);

    if (!fromWarehouse || !toWarehouse) {
      alert("⚠️ Invalid warehouse selection.");
      return;
    }

    if (fromWarehouse.stock < qty) {
      alert(
        `🚫 Not enough stock in ${fromWarehouse.name}. Available: ${fromWarehouse.stock}`
      );
      return;
    }

    setWarehouses((prev) =>
      prev.map((w) => {
        if (w.name === from) {
          return { ...w, stock: w.stock - qty };
        } else if (w.name === to) {
          return { ...w, stock: w.stock + qty };
        }
        return w;
      })
    );

    setTransferData({ from: "", to: "", quantity: "" });
    alert(`🔄 Transferred ${qty} units from ${from} to ${to}`);
  };

  // ✅ Allocate inventory to high-demand areas
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
            <tr key={w.id}>
              <td>{w.id}</td>
              <td>
                {editing === w.id ? (
                  <input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  w.name
                )}
              </td>
              <td>
                {editing === w.id ? (
                  <input
                    type="number"
                    value={editData.stock}
                    onChange={(e) =>
                      setEditData({ ...editData, stock: e.target.value })
                    }
                  />
                ) : (
                  w.stock
                )}
              </td>
              <td>
                {editing === w.id ? (
                  <input
                    type="number"
                    value={editData.demand}
                    onChange={(e) =>
                      setEditData({ ...editData, demand: e.target.value })
                    }
                  />
                ) : (
                  w.demand
                )}
              </td>
              <td>
                {editing === w.id ? (
                  <button onClick={() => saveEdit(w.id)}>Save</button>
                ) : (
                  <button onClick={() => startEdit(w.id)}>Edit</button>
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
          onChange={(e) =>
            setNewWarehouse({ ...newWarehouse, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Stock"
          value={newWarehouse.stock}
          onChange={(e) =>
            setNewWarehouse({ ...newWarehouse, stock: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Demand"
          value={newWarehouse.demand}
          onChange={(e) =>
            setNewWarehouse({ ...newWarehouse, demand: e.target.value })
          }
        />
        <button onClick={addWarehouse}>Add</button>
      </div>

      <h3>🚚 Inter-Warehouse Transfer</h3>
      <div>
        <label>From: </label>
        <select
          value={transferData.from}
          onChange={(e) =>
            setTransferData({ ...transferData, from: e.target.value })
          }
        >
          <option value="">Select</option>
          {warehouses.map((w) => (
            <option key={w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>

        <label> To: </label>
        <select
          value={transferData.to}
          onChange={(e) =>
            setTransferData({ ...transferData, to: e.target.value })
          }
        >
          <option value="">Select</option>
          {warehouses.map((w) => (
            <option key={w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>

        <label> Quantity: </label>
        <input
          type="number"
          value={transferData.quantity}
          onChange={(e) =>
            setTransferData({ ...transferData, quantity: e.target.value })
          }
        />
        <button onClick={transferStock}>Transfer</button>
      </div>

      <br />
      <button onClick={allocateToDemand}>Allocate to High-Demand Areas</button>

      <h3>💰 Cost Overview</h3>
      <p>
        Estimated Transportation + Holding Cost:{" "}
        <strong>{formatPeso(calculateTotalCost())}</strong>
      </p>
    </div>
  );
}

export default InventoryDistribution;
