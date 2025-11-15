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

  const API_URL = "http://localhost:8000/api/logistics";
  const SUPPLIER_API = "http://localhost:8000/api/suppliers";

  // Fetch Routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(API_URL);
      setRoutes(res.data);
    } catch (err) {
      console.error("Fetch routes error:", err);
    }
  };

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(SUPPLIER_API);
      if (Array.isArray(res.data)) setSuppliers(res.data);
      else if (res.data && Array.isArray(res.data.suppliers)) setSuppliers(res.data.suppliers);
      else setSuppliers([]);
    } catch (err) {
      console.error("❌ Fetch suppliers error:", err);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchSuppliers();
  }, []);

  // Add Route
  const addRoute = async () => {
    if (!newRoute.supplier || !newRoute.warehouse || !newRoute.customer || !newRoute.date) {
      alert("Please complete all route details.");
      return;
    }
    try {
      await axios.post(API_URL, newRoute);
      setNewRoute({ supplier: "", warehouse: "", customer: "", type: "Inbound", date: "" });
      fetchRoutes();
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

        {/* Supplier Dropdown */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "6px" }}>Supplier:</label>
          <select
            value={newRoute.supplier}
            onChange={(e) => setNewRoute({ ...newRoute, supplier: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" }}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s.name || s.supplierName}>
                {s.name || s.supplierName}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead style={{ background: "#f0f0f0" }}>
                <tr>
                  <th style={{ padding: "10px" }}>Supplier</th>
                  <th style={{ padding: "10px" }}>Warehouse</th>
                  <th style={{ padding: "10px" }}>Customer</th>
                  <th style={{ padding: "10px" }}>Type</th>
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Status</th>
                  <th style={{ padding: "10px" }}>Progress</th>
                  <th style={{ padding: "10px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{r.supplier}</td>
                    <td style={{ padding: "10px" }}>{r.warehouse}</td>
                    <td style={{ padding: "10px" }}>{r.customer}</td>
                    <td style={{ padding: "10px" }}>{r.type}</td>
                    <td style={{ padding: "10px" }}>{r.date}</td>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogisticsSupplyChain;
