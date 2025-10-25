import React, { useState } from "react";

function LogisticsSupplyChain() {
  const [routes, setRoutes] = useState([]);
  const [newRoute, setNewRoute] = useState({
    supplier: "",
    warehouse: "",
    customer: "",
    type: "Inbound",
    date: "",
  });

  // Add a new planned route
  const addRoute = () => {
    if (!newRoute.supplier || !newRoute.warehouse || !newRoute.customer || !newRoute.date) {
      alert("Please complete all route details.");
      return;
    }

    const newPlan = {
      id: routes.length + 1,
      ...newRoute,
      status: "Scheduled",
      progress: "Not started",
      priority: "Normal",
    };

    setRoutes([...routes, newPlan]);
    setNewRoute({ supplier: "", warehouse: "", customer: "", type: "Inbound", date: "" });
  };

  // Optimize (just reorder or mark priorities)
  const optimizeRoutes = () => {
    if (routes.length === 0) {
      alert("No routes to optimize.");
      return;
    }

    const updated = routes.map((r, i) => ({
      ...r,
      priority: `Priority ${i + 1}`,
    }));

    setRoutes(updated);
    alert("Routes optimized successfully!");
  };

  // Track (simulate shipment progress)
  const trackShipment = (id) => {
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.status === "Scheduled") return { ...r, status: "In Transit", progress: "En route..." };
          if (r.status === "In Transit") return { ...r, status: "Delivered", progress: "Delivered ✔️" };
        }
        return r;
      })
    );
  };

  // View planned routes
  const viewRoutes = () => {
    if (routes.length === 0) {
      alert("No planned routes yet.");
      return;
    }

    let display = "🗺️ Current Planned Routes:\n";
    routes.forEach((r, i) => {
      display += `${i + 1}. ${r.supplier} → ${r.warehouse} → ${r.customer} | ${r.type} | ${r.status}\n`;
    });
    alert(display);
  };

  return (
    <div>
      <h2>🚚 Logistics & Transportation Management</h2>

      <h3>Plan Route</h3>
      <input
        placeholder="Supplier"
        value={newRoute.supplier}
        onChange={(e) => setNewRoute({ ...newRoute, supplier: e.target.value })}
      />
      <input
        placeholder="Warehouse"
        value={newRoute.warehouse}
        onChange={(e) => setNewRoute({ ...newRoute, warehouse: e.target.value })}
      />
      <input
        placeholder="Customer"
        value={newRoute.customer}
        onChange={(e) => setNewRoute({ ...newRoute, customer: e.target.value })}
      />
      <select
        value={newRoute.type}
        onChange={(e) => setNewRoute({ ...newRoute, type: e.target.value })}
      >
        <option value="Inbound">Inbound</option>
        <option value="Outbound">Outbound</option>
      </select>
      <input
        type="date"
        value={newRoute.date}
        onChange={(e) => setNewRoute({ ...newRoute, date: e.target.value })}
      />
      <button onClick={addRoute}>Add Route</button>

      <br /><br />
      <button onClick={viewRoutes}>View Planned Routes</button>
      <button onClick={optimizeRoutes}>Optimize Routes</button>

      <h3>Route Records</h3>
      {routes.length === 0 ? (
        <p>No routes yet.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>ID</th>
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
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.supplier}</td>
                <td>{r.warehouse}</td>
                <td>{r.customer}</td>
                <td>{r.type}</td>
                <td>{r.date}</td>
                <td>{r.status}</td>
                <td>{r.progress}</td>
                <td>{r.priority}</td>
                <td>
                  <button onClick={() => trackShipment(r.id)}>Track Shipment</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LogisticsSupplyChain;
