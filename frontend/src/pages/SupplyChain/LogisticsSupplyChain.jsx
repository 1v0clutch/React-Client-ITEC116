import React, { useState, useEffect } from "react";
import axios from "axios";

function LogisticsSupplyChain() {
  const [routes, setRoutes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [newRoute, setNewRoute] = useState({
    supplier: "",
    warehouse: "",
    customer: "",
    type: "Inbound",
    date: "",
  });

  // ⚙️ Backend API URLs
  const API_URL = "http://localhost:8000/api/logistics";
  const SUPPLIER_API = "http://localhost:8000/api/suppliers"; // Module 3 endpoint

  // ✅ Fetch routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(API_URL);
      setRoutes(res.data);
    } catch (err) {
      console.error("❌ Error fetching routes:", err);
    }
  };

  // ✅ Fetch suppliers (from Module 3)
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(SUPPLIER_API);
      console.log("✅ Suppliers fetched:", res.data);
      setSuppliers(res.data);
    } catch (err) {
      console.error("❌ Error fetching suppliers:", err);
      alert("Cannot fetch suppliers from Module 3. Please check backend URL or port.");
    }
  };

  // ✅ On Mount
  useEffect(() => {
    fetchRoutes();
    fetchSuppliers();
  }, []);

  // ✅ Add Route
  const addRoute = async () => {
    if (!newRoute.supplier || !newRoute.warehouse || !newRoute.customer || !newRoute.date) {
      alert("⚠️ Please complete all route details.");
      return;
    }

    try {
      await axios.post(API_URL, newRoute);
      alert("✅ Route added successfully!");
      setNewRoute({
        supplier: "",
        warehouse: "",
        customer: "",
        type: "Inbound",
        date: "",
      });
      fetchRoutes();
    } catch (err) {
      console.error("❌ Add route error:", err);
      alert("Failed to add route. Please check your backend.");
    }
  };

  // ✅ Delete Route
  const deleteRoute = async (id) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("🗑️ Route deleted successfully!");
      fetchRoutes();
    } catch (err) {
      console.error("❌ Delete route error:", err);
      alert("Failed to delete route.");
    }
  };

  // ✅ Track Shipment
  const trackShipment = async (id, currentStatus) => {
    let newStatus, newProgress;

    if (currentStatus === "Scheduled") {
      newStatus = "In Transit";
      newProgress = "🚚 En route...";
    } else if (currentStatus === "In Transit") {
      newStatus = "Delivered";
      newProgress = "✅ Delivered";
    } else {
      alert("This shipment is already delivered.");
      return;
    }

    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus, progress: newProgress });
      fetchRoutes();
    } catch (err) {
      console.error("❌ Track shipment error:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI" }}>
      <h2>🚚 Logistics & Transportation Management</h2>
      <h3>Plan New Route</h3>

      {/* ✅ Supplier Dropdown (connected to Module 3) */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
          Supplier:
        </label>
        <div
          style={{
            width: "260px",
            maxHeight: "120px",
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: "6px",
            background: "#fff",
          }}
        >
          <select
            value={newRoute.supplier}
            onChange={(e) => setNewRoute({ ...newRoute, supplier: e.target.value })}
            style={{
              width: "100%",
              padding: "6px",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name} — {s.item || "No item"} ({s.status || "N/A"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🏭 Other Inputs */}
      <input
        placeholder="Warehouse"
        value={newRoute.warehouse}
        onChange={(e) => setNewRoute({ ...newRoute, warehouse: e.target.value })}
        style={{ marginRight: "10px" }}
      />
      <input
        placeholder="Customer"
        value={newRoute.customer}
        onChange={(e) => setNewRoute({ ...newRoute, customer: e.target.value })}
        style={{ marginRight: "10px" }}
      />
      <select
        value={newRoute.type}
        onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })}
        style={{ marginRight: "10px" }}
      >
        <option value="Inbound">Inbound</option>
        <option value="Outbound">Outbound</option>
      </select>
      <input
        type="date"
        value={newRoute.date}
        onChange={(e) => setNewRoute({ ...newRoute, date: e.target.value })}
        style={{ marginRight: "10px" }}
      />
      <button onClick={addRoute}>Add Route</button>

      {/* 📋 Route Records Table */}
      <h3 style={{ marginTop: "20px" }}>Route Records</h3>
      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {routes.length === 0 ? (
          <p>No routes yet.</p>
        ) : (
          <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "10px" }}>
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Priority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td>{r.supplier}</td>
                  <td>{r.warehouse}</td>
                  <td>{r.customer}</td>
                  <td>{r.type}</td>
                  <td>{r.date}</td>
                  <td>{r.status}</td>
                  <td>{r.progress}</td>
                  <td>{r.priority}</td>
                  <td>
                    <button onClick={() => trackShipment(r._id, r.status)}>Track</button>
                    <button
                      style={{ color: "red", marginLeft: "8px" }}
                      onClick={() => deleteRoute(r._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default LogisticsSupplyChain;
