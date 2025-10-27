import React, { useState, useEffect } from "react";
import axios from "axios";

function Procurement() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({ stock: "", threshold: "" });
  const [log, setLog] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [showEvaluation, setShowEvaluation] = useState(false); // toggle evaluation panel

  const SUPPLIER_API = "http://localhost:8000/api/suppliers";

  const logMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${msg}`]);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(SUPPLIER_API);
        setSuppliers(Array.isArray(res.data) ? res.data.map(s => ({ ...s, showEval: false })) : []);
        logMessage("✅ Supplier data synced successfully.");
      } catch (err) {
        logMessage("❌ Failed to fetch suppliers.");
        console.error(err);
      }
    };
    fetchSuppliers();
  }, []);

  const placeOrder = () => {
    if (!selectedSupplier) {
      logMessage("⚠️ Please select a supplier first.");
      return;
    }
    const supplier = suppliers.find((s) => s._id === selectedSupplier);
    const order = {
      id: Date.now(),
      supplier: supplier.name,
      deliveryTime: Math.floor(Math.random() * 5) + 2,
      status: "Processing",
    };
    setOrders((prev) => [...prev, order]);
    logMessage(`📦 Order placed with ${supplier.name}.`);

    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Delivery received from ${supplier.name}.`);
    }, 3000);
  };

  const updateOrderStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const checkInventory = () => {
    const stock = Number(inventory.stock);
    const threshold = Number(inventory.threshold);

    if (isNaN(stock) || isNaN(threshold)) {
      logMessage("⚠️ Invalid stock or threshold value.");
      return;
    }

    if (stock < threshold) {
      logMessage(`⚠️ Stock below threshold (${stock} < ${threshold}). Auto-ordering...`);
      autoOrder();
    } else {
      logMessage(`✅ Stock sufficient (${stock} ≥ ${threshold}).`);
    }
  };

  const autoOrder = () => {
    if (suppliers.length === 0) {
      logMessage("❌ No suppliers available for automatic order.");
      return;
    }
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const order = {
      id: Date.now(),
      supplier: randomSupplier.name,
      deliveryTime: Math.floor(Math.random() * 5) + 2,
      status: "Processing",
    };
    setOrders((prev) => [...prev, order]);
    logMessage(`🤝 Automatically ordered from ${randomSupplier.name}.`);

    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Auto-delivery received from ${randomSupplier.name}.`);
    }, 3000);
  };

  const evaluateSupplier = (id) => {
    const supplier = suppliers.find((s) => s._id === id);
    if (!supplier.evaluation || Object.keys(supplier.evaluation).length < 3) {
      alert("Please rate all criteria before submitting.");
      return;
    }
    setSuppliers((prev) =>
      prev.map((s) => (s._id === id ? { ...s, evaluated: true, showEval: false } : s))
    );
    const score = (
      Object.values(supplier.evaluation).reduce((a, b) => a + b, 0) / 3
    ).toFixed(1);
    logMessage(`📊 Supplier ${supplier.name} evaluated with score ${score}`);
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find((s) => s._id === id);
    if (window.confirm(`Delete supplier ${supplier.name}?`)) {
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
      logMessage(`❌ Supplier ${supplier.name} deleted.`);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI", padding: "25px", maxWidth: "1200px", margin: "auto", background: "#f7f7f7" }}>
      <h2 style={{ marginBottom: "25px", color: "#333" }}>🛒 Procurement & Supplier Coordination</h2>

      {/* --- Top Section: Supplier + Inventory */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        {/* Supplier Selection */}
        <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <h3>👷 Supplier Selection</h3>
          <p style={{ fontSize: "14px", color: "#666" }}>Select a supplier to place manual orders.</p>
          {suppliers.length > 0 ? (
            <>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={placeOrder}
                style={{ width: "100%", padding: "10px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Place Order
              </button>
            </>
          ) : (
            <p>No suppliers available. Add some in Module 3.</p>
          )}
        </div>

        {/* Inventory Monitoring */}
        <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <h3>📦 Inventory Monitoring</h3>
          <p style={{ fontSize: "14px", color: "#666" }}>Monitor stock levels and auto-trigger orders when thresholds are reached.</p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Current Stock"
              value={inventory.stock}
              onChange={(e) => setInventory({ ...inventory, stock: e.target.value })}
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              placeholder="Threshold"
              value={inventory.threshold}
              onChange={(e) => setInventory({ ...inventory, threshold: e.target.value })}
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>
          <button
            onClick={checkInventory}
            style={{ width: "100%", padding: "10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Check & Auto-Order
          </button>
        </div>
      </div>

          {/* --- Active Orders */}
      <div style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        marginBottom: "30px"
      }}>
        <h3>📋 Active Orders</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>Track all current orders and their status.</p>
        {orders.length ? (
          <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th>Supplier</th>
                <th>Delivery Time (days)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.supplier}</td>
                  <td>{o.deliveryTime}</td>
                  <td style={{ color: o.status === "Delivered" ? "green" : "orange" }}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No active orders yet.</p>
        )}
      </div>

      
      {/* --- Button to show evaluation */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowEvaluation(!showEvaluation)}
          style={{ padding: "10px 20px", background: "#ffc107", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          {showEvaluation ? "Hide Supplier Evaluation" : "Show Supplier Evaluation"}
        </button>
      </div>

      {/* --- Supplier Evaluation Cards */}
      {showEvaluation && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "15px" }}>📊 Supplier Evaluation</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {suppliers.length ? suppliers.map((s) => (
              <div key={s._id} style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                width: "300px",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <h4 style={{ marginBottom: "5px" }}>{s.name}</h4>
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  Status: {s.evaluated ? "✅ Evaluated" : "⏳ Pending"}
                </p>

                {!s.evaluated && (
                  <button
                    onClick={() => setSuppliers(prev => prev.map(sup =>
                      sup._id === s._id ? { ...sup, showEval: !sup.showEval } : sup
                    ))}
                    style={{
                      padding: "6px 10px",
                      background: "#ffc107",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginTop: "5px"
                    }}
                  >
                    {s.showEval ? "Hide Evaluation" : "Evaluate"}
                  </button>
                )}

                {s.showEval && !s.evaluated && (
                  <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {["Delivery Timeliness", "Product Quality", "Communication"].map((crit) => (
                      <div key={crit} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "14px" }}>{crit}</span>
                        <select
                          value={s.evaluation?.[crit] ?? ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSuppliers(prev => prev.map(sup =>
                              sup._id === s._id
                                ? { ...sup, evaluation: { ...sup.evaluation, [crit]: val } }
                                : sup
                            ));
                          }}
                          style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid #ccc" }}
                        >
                          <option value="">--</option>
                          {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    ))}

                    {s.evaluation && Object.keys(s.evaluation).length === 3 && (
                      <p style={{ margin: "8px 0", fontWeight: "bold", color: "#007bff" }}>
                        Overall Score: {(Object.values(s.evaluation).reduce((a,b)=>a+b,0)/3).toFixed(1)}/5
                      </p>
                    )}

                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => evaluateSupplier(s._id)}
                        style={{ flex: 1, padding: "8px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => deleteSupplier(s._id)}
                        style={{ flex: 1, padding: "8px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )) : <p>No suppliers to evaluate.</p>}
          </div>
        </div>
      )}

      {/* --- Activity Log */}
      <div style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "20px", maxHeight: "250px", overflowY: "auto", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
        <h3>📝 Activity Log</h3>
        <p style={{ fontSize: "14px", color: "#666" }}>All procurement activities are logged here.</p>
        {log.length ? log.map((entry, i) => <p key={i} style={{ margin: "4px 0" }}>{entry}</p>) : <p>No activity yet.</p>}
      </div>
    </div>
  );
}

export default Procurement;
