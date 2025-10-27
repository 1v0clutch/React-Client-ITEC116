import React, { useState, useEffect } from "react";
import axios from "axios";

function Procurement() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    supplierName: "",
    item: "",
    rating: "",
    avgDelay: "",
  });
  const [inventory, setInventory] = useState({ stock: "", threshold: "" });
  const [log, setLog] = useState([]);

  const API_URL = "http://localhost:8000/api/procurement";

  const logMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // --- Load suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(API_URL);
        setSuppliers(res.data);
        logMessage("✅ Suppliers loaded from server.");
      } catch (err) {
        logMessage("❌ Failed to fetch suppliers from server.");
        console.error(err);
      }
    };
    fetchSuppliers();
  }, []);

  // --- Add Supplier
  const addSupplier = async () => {
    const { supplierName, item, rating, avgDelay } = newSupplier;
    if (!supplierName || !item || !rating || !avgDelay) {
      logMessage("⚠️ Please fill in all supplier details.");
      return;
    }

    const supplier = { supplierName, item, rating: parseFloat(rating), avgDelay: parseInt(avgDelay) };

    try {
      const res = await axios.post(API_URL, supplier);
      setSuppliers((prev) => [...prev, res.data]);
      logMessage(`✅ Added supplier: ${supplierName} (${item}).`);
      setNewSupplier({ supplierName: "", item: "", rating: "", avgDelay: "" });
    } catch (err) {
      logMessage("❌ Failed to add supplier to database.");
      console.error(err);
    }
  };

  // --- Delete Supplier
  const deleteSupplier = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
      logMessage("🗑️ Supplier deleted successfully.");
    } catch (err) {
      logMessage("❌ Failed to delete supplier.");
      console.error(err);
    }
  };

  // --- Place Order
  const placeOrder = (supplier) => {
    const order = { id: Date.now(), supplier: supplier.supplierName, item: supplier.item, deliveryTime: supplier.avgDelay, status: "Processing" };
    setOrders((prev) => [...prev, order]);
    logMessage(`📦 Order placed to ${supplier.supplierName} for ${supplier.item}.`);
    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Delivery received from ${supplier.supplierName}.`);
    }, supplier.avgDelay * 1000);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  // --- Inventory Check
  const checkInventory = () => {
    const stock = Number(inventory.stock);
    const threshold = Number(inventory.threshold);
    if (isNaN(stock) || isNaN(threshold)) return logMessage("⚠️ Invalid stock or threshold.");
    if (stock < threshold) {
      logMessage(`⚠️ Stock low (${stock}). Auto-ordering...`);
      autoOrder();
    } else logMessage(`✅ Stock level is sufficient (${stock}).`);
  };

  const autoOrder = () => {
    if (suppliers.length === 0) return logMessage("❌ No suppliers available for auto order.");
    const bestSupplier = [...suppliers].sort((a, b) => b.rating - a.rating || a.avgDelay - b.avgDelay)[0];
    placeOrder(bestSupplier);
    logMessage(`🤝 Auto-ordered from ${bestSupplier.supplierName} (Rating: ${bestSupplier.rating}, Delay: ${bestSupplier.avgDelay}).`);
  };

  const evaluateSuppliers = () => {
    if (suppliers.length === 0) return logMessage("⚠️ No suppliers to evaluate.");
    const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;
    const goodSuppliers = suppliers.filter((s) => s.rating >= 4);
    const delayedSuppliers = suppliers.filter((s) => s.avgDelay > 5);
    logMessage(`📊 Avg Rating: ${avgRating.toFixed(2)} | Good: ${goodSuppliers.length} | Delayed: ${delayedSuppliers.length}`);
  };

  return (
    <div>
      <h2>Procurement Module</h2>
      <p>Ensures timely acquisition of raw materials by coordinating suppliers and monitoring inventory.</p>

      <h3>Add Supplier</h3>
      <input placeholder="Supplier Name" value={newSupplier.supplierName} onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })} />
      <input placeholder="Item" value={newSupplier.item} onChange={(e) => setNewSupplier({ ...newSupplier, item: e.target.value })} />
      <input type="number" placeholder="Rating (1-5)" value={newSupplier.rating} onChange={(e) => setNewSupplier({ ...newSupplier, rating: e.target.value })} />
      <input type="number" placeholder="Avg Delay (days)" value={newSupplier.avgDelay} onChange={(e) => setNewSupplier({ ...newSupplier, avgDelay: e.target.value })} />
      <button onClick={addSupplier}>Add Supplier</button>

      <h3>Supplier List</h3>
      {suppliers.length ? (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Item</th>
              <th>Rating</th>
              <th>Delay</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td>{s.supplierName}</td>
                <td>{s.item}</td>
                <td>{s.rating}</td>
                <td>{s.avgDelay}</td>
                <td>{s.status}</td>
                <td>
                  <button onClick={() => placeOrder(s)}>Order</button>
                  <button onClick={() => deleteSupplier(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No suppliers yet.</p>
      )}

      <h3>Inventory Check</h3>
      <input type="number" placeholder="Current Stock" value={inventory.stock} onChange={(e) => setInventory({ ...inventory, stock: e.target.value })} />
      <input type="number" placeholder="Threshold" value={inventory.threshold} onChange={(e) => setInventory({ ...inventory, threshold: e.target.value })} />
      <button onClick={checkInventory}>Check & Auto Order</button>

      <h3>Orders</h3>
      {orders.length ? (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Item</th>
              <th>Delivery Time (days)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.supplier}</td>
                <td>{o.item}</td>
                <td>{o.deliveryTime}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders yet.</p>
      )}

      <button onClick={evaluateSuppliers}>Evaluate Supplier Performance</button>

      <h3>System Log</h3>
      <div>
        {log.map((entry, i) => (
          <p key={i}>{entry}</p>
        ))}
      </div>
    </div>
  );
}

export default Procurement;
