import React, { useState, useEffect } from "react";
import axios from "axios";

function LogisticsSupplyChain() {
  const [routes, setRoutes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [newRoute, setNewRoute] = useState({
    itemId: "",
    warehouse: "",
    customer: "",
    type: "Inbound",
    date: "",
    quantity: 0,
  });

  const API_URL = "http://localhost:8000/api/logistics";
  const INVENTORY_API = "http://localhost:8000/api/inventory/getItems";

  // Fetch Routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(API_URL);
      setRoutes(res.data);
    } catch (err) {
      console.error("Fetch routes error:", err);
    }
  };

  // Fetch Inventory Items
  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(INVENTORY_API);
      if (Array.isArray(res.data)) setInventoryItems(res.data);
      else setInventoryItems([]);
    } catch (err) {
      console.error("❌ Fetch inventory error:", err);
      setInventoryItems([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchInventoryItems();
  }, []);

  // Add Route
  const addRoute = async () => {
    if (!newRoute.itemId || !newRoute.warehouse || !newRoute.customer || !newRoute.date || !newRoute.quantity) {
      alert("Please complete all route details.");
      return;
    }

    // Optional: check if inventory has enough quantity
    const selectedItem = inventoryItems.find((item) => item._id === newRoute.itemId);
    if (!selectedItem || selectedItem.quantity < newRoute.quantity) {
      alert(`Not enough stock for ${selectedItem?.name || "this item"}.`);
      return;
    }

    try {
      await axios.post(API_URL, newRoute);
      setNewRoute({
        itemId: "",
        warehouse: "",
        customer: "",
        type: "Inbound",
        date: "",
        quantity: 0,
      });
      fetchRoutes();
      fetchInventoryItems(); // Update stock if needed
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add route.");
    }
  };

  // Delete Route
  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchRoutes();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete route.");
    }
  };

  // Track Shipment
  const trackShipment = async (id, currentStatus) => {
    let newStatus, newProgress;
    if (currentStatus === "Scheduled") {
      newStatus = "In Transit";
      newProgress = "En route...";
    } else if (currentStatus === "In Transit") {
      newStatus = "Delivered";
      newProgress = "Delivered ✔️";
    } else {
      alert("This shipment is already delivered.");
      return;
    }
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus, progress: newProgress });
      fetchRoutes();
      fetchInventoryItems(); // Update inventory if needed
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "25px", fontFamily: "Segoe UI", maxWidth: "1200px", margin: "auto", background: "#f5f5f5" }}>
      <h2 style={{ marginBottom: "25px", color: "#333" }}>🚚 Logistics & Transportation Management</h2>

      {/* --- Add Route Section */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", color: "#007bff" }}>🗺️ Plan Route</h3>

        {/* Inventory Item Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Item:</label>
          <select
            value={newRoute.itemId}
            onChange={(e) => setNewRoute({ ...newRoute, itemId: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" }}
          >
            <option value="">Select Item</option>
            {inventoryItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} (Stock: {item.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Other Inputs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
          <input
            placeholder="Warehouse"
            value={newRoute.warehouse}
            onChange={(e) => setNewRoute({ ...newRoute, warehouse: e.target.value })}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            placeholder="Customer"
            value={newRoute.customer}
            onChange={(e) => setNewRoute({ ...newRoute, customer: e.target.value })}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <select
            value={newRoute.type}
            onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="Inbound">Inbound</option>
            <option value="Outbound">Outbound</option>
          </select>
          <input
            type="date"
            value={newRoute.date}
            onChange={(e) => setNewRoute({ ...newRoute, date: e.target.value })}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <input
            type="number"
            placeholder="Quantity"
            min={1}
            value={newRoute.quantity}
            onChange={(e) => setNewRoute({ ...newRoute, quantity: Number(e.target.value) })}
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>
        <button
          onClick={addRoute}
          style={{ padding: "12px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Add Route
        </button>
      </div>

      {/* --- Route Records Table */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <h3 style={{ marginBottom: "15px", color: "#28a745" }}>📋 Route Records</h3>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {routes.length === 0 ? (
            <p>No routes yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#f0f0f0" }}>
                <tr>
                  <th style={{ padding: "10px" }}>Item</th>
                  <th style={{ padding: "10px" }}>Warehouse</th>
                  <th style={{ padding: "10px" }}>Customer</th>
                  <th style={{ padding: "10px" }}>Type</th>
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Quantity</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px" }}>Progress</th>
                  <th style={{ padding: "10px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => {
                  const item = inventoryItems.find((i) => i._id === r.itemId);
                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{item?.name || "Unknown Item"}</td>
                      <td style={{ padding: "10px" }}>{r.warehouse}</td>
                      <td style={{ padding: "10px" }}>{r.customer}</td>
                      <td style={{ padding: "10px" }}>{r.type}</td>
                      <td style={{ padding: "10px" }}>{r.date}</td>
                      <td style={{ padding: "10px" }}>{r.quantity}</td>
                      <td style={{ padding: "10px" }}>{r.status}</td>
                      <td style={{ padding: "10px" }}>{r.progress}</td>
                      <td style={{ padding: "10px", display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => trackShipment(r._id, r.status)}
                          style={{ padding: "6px 10px", background: "#ffc107", border: "none", borderRadius: "5px", cursor: "pointer" }}
                        >
                          Track
                        </button>
                        <button
                          onClick={() => deleteRoute(r._id)}
                          style={{ padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogisticsSupplyChain;
