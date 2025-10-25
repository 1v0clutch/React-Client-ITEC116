import React, { useState } from "react";

function Procurement() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    item: "",
    rating: "",
    avgDelay: "",
  });
  const [inventory, setInventory] = useState({ stock: "", threshold: "" });
  const [log, setLog] = useState([]);

  // --- Utility for logs with timestamp ---
  const logMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // --- Add Supplier ---
  const addSupplier = () => {
    const { name, item, rating, avgDelay } = newSupplier;
    if (!name || !item || !rating || !avgDelay) {
      logMessage("⚠️ Please fill in all supplier details.");
      return;
    }

    const supplier = {
      id: Date.now(),
      name,
      item,
      rating: parseFloat(rating),
      avgDelay: parseInt(avgDelay),
      performance: "Good",
      status: "Available",
    };

    setSuppliers((prev) => [...prev, supplier]);
    logMessage(`Added supplier: ${name} (${item}) with rating ${rating}.`);
    setNewSupplier({ name: "", item: "", rating: "", avgDelay: "" });
  };

  // --- Place Manual Order ---
  const placeOrder = (supplier) => {
    const order = {
      id: Date.now(),
      supplier: supplier.name,
      item: supplier.item,
      deliveryTime: supplier.avgDelay,
      status: "Processing",
    };

    setOrders((prev) => [...prev, order]);
    logMessage(`📦 Order placed to ${supplier.name} for ${supplier.item}.`);

    // Simulate delivery after delay (seconds)
    setTimeout(() => {
      updateOrderStatus(order.id, "Delivered");
      logMessage(`✅ Delivery received from ${supplier.name}.`);
    }, supplier.avgDelay * 1000);
  };

  // --- Update order status ---
  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // --- Check inventory and auto order ---
  const checkInventory = () => {
    const stock = Number(inventory.stock);
    const threshold = Number(inventory.threshold);

    if (isNaN(stock) || isNaN(threshold)) {
      logMessage("⚠️ Invalid stock or threshold.");
      return;
    }

    if (stock < threshold) {
      logMessage(
        `⚠️ Stock (${stock}) below threshold (${threshold}). Auto-ordering...`
      );
      autoOrder();
    } else {
      logMessage(`✅ Stock level is sufficient (${stock}).`);
    }
  };

  // --- Auto order from best supplier ---
  const autoOrder = () => {
    if (suppliers.length === 0) {
      logMessage("❌ No suppliers available for auto order.");
      return;
    }

    // Pick best supplier by rating and lowest delay
    const bestSupplier = [...suppliers].sort(
      (a, b) => b.rating - a.rating || a.avgDelay - b.avgDelay
    )[0];

    placeOrder(bestSupplier);
    logMessage(
      `🤝 Auto-ordered from ${bestSupplier.name} (Rating: ${bestSupplier.rating}, Delay: ${bestSupplier.avgDelay} days).`
    );
  };

  // --- Evaluate Supplier Performance ---
  const evaluateSuppliers = () => {
    if (suppliers.length === 0) {
      logMessage("⚠️ No suppliers to evaluate.");
      return;
    }

    const avgRating =
      suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length;

    const goodSuppliers = suppliers.filter((s) => s.rating >= 4);
    const delayedSuppliers = suppliers.filter((s) => s.avgDelay > 5);

    logMessage(
      `📊 Avg Rating: ${avgRating.toFixed(2)} | Good: ${
        goodSuppliers.length
      } | Delayed: ${delayedSuppliers.length}`
    );
  };

  return (
    <div>
      <h2>Procurement Module</h2>
      <p>
        Ensures timely acquisition of raw materials and components by
        coordinating suppliers, monitoring inventory, and automating orders.
      </p>

      <h3>Add Supplier</h3>
      <input
        placeholder="Supplier Name"
        value={newSupplier.name}
        onChange={(e) =>
          setNewSupplier({ ...newSupplier, name: e.target.value })
        }
      />
      <input
        placeholder="Item"
        value={newSupplier.item}
        onChange={(e) =>
          setNewSupplier({ ...newSupplier, item: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Rating (1-5)"
        value={newSupplier.rating}
        onChange={(e) =>
          setNewSupplier({ ...newSupplier, rating: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Avg Delay (days)"
        value={newSupplier.avgDelay}
        onChange={(e) =>
          setNewSupplier({ ...newSupplier, avgDelay: e.target.value })
        }
      />
      <button onClick={addSupplier}>Add Supplier</button>

      <h3>Supplier List</h3>
      {suppliers.length > 0 ? (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Name</th>
              <th>Item</th>
              <th>Rating</th>
              <th>Delay (days)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.item}</td>
                <td>{s.rating}</td>
                <td>{s.avgDelay}</td>
                <td>{s.status}</td>
                <td>
                  <button onClick={() => placeOrder(s)}>Order</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No suppliers yet.</p>
      )}

      <h3>Inventory Check</h3>
      <input
        type="number"
        placeholder="Current Stock"
        value={inventory.stock}
        onChange={(e) =>
          setInventory({ ...inventory, stock: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Threshold"
        value={inventory.threshold}
        onChange={(e) =>
          setInventory({ ...inventory, threshold: e.target.value })
        }
      />
      <button onClick={checkInventory}>Check & Auto Order</button>

      <h3>Orders</h3>
      {orders.length > 0 ? (
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
