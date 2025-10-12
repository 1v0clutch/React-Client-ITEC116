import { useState, useEffect } from "react";

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]); // ✅ products of selected supplier
  const [form, setForm] = useState({
    requisitionId: "",
    supplierId: "",
    items: [{ itemId: "", quantity: 1, price: 0 }],
  });

  const inputStyle = {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };

  // ✅ Fetch requisitions
  useEffect(() => {
    fetch("http://localhost:8000/api/requisitions/getRequisition")
      .then((res) => res.json())
      .then((data) => setRequisitions(data))
      .catch((err) => console.error("Error fetching requisitions:", err));
  }, []);

  // ✅ Fetch suppliers
  useEffect(() => {
    fetch("http://localhost:8000/api/suppliers/getSupplier")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // ✅ Fetch items from selected supplier
  useEffect(() => {
    if (form.supplierId) {
      fetch(`http://localhost:8000/api/suppliers/${form.supplierId}/products`)
        .then((res) => res.json())
        .then((data) => setItems(data))
        .catch((err) => console.error("Error fetching supplier items:", err));
    } else {
      setItems([]);
    }
  }, [form.supplierId]);

  // ✅ Fetch purchase orders
  useEffect(() => {
    fetch("http://localhost:8000/api/purchase-orders/getPurchaseOrder")
      .then((res) => res.json())
      .then((data) => setPurchaseOrders(data))
      .catch((err) => console.error("Error fetching POs:", err));
  }, []);

  // ✅ Add purchase order
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:8000/api/purchase-orders/addPurchaseOrder",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        return alert("Error: " + data.error);
      }

      // backend returns { message, po }
      setPurchaseOrders([...purchaseOrders, data.po]);

      // reset form
      setForm({
        requisitionId: "",
        supplierId: "",
        items: [{ itemId: "", quantity: 1, price: 0 }],
      });
    } catch (err) {
      console.error("Error adding PO:", err);
    }
  };

  // ✅ Update status
  const handleUpdateStatus = async (id, status) => {
    const res = await fetch(
      `http://localhost:8000/api/purchase-orders/updatePurchaseOrder/${id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const updated = await res.json();
    setPurchaseOrders(
      purchaseOrders.map((po) => (po._id === id ? updated : po))
    );
  };

  // ✅ Delete PO
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Purchase Order?")) return;
    await fetch(
      `http://localhost:8000/api/purchase-orders/deletePurchaseOrder/${id}`,
      { method: "DELETE" }
    );
    setPurchaseOrders(purchaseOrders.filter((po) => po._id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Purchase Orders</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
          maxWidth: "800px",
          background: "#f9f9f9",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        {/* Left Column */}
        <div>
          <label>Requester (Requisition)</label>
          <select
            style={inputStyle}
            value={form.requisitionId}
            onChange={(e) =>
              setForm({ ...form, requisitionId: e.target.value })
            }
            required
          >
            <option value="">-- Select Requisition --</option>
            {requisitions.map((req) => (
              <option key={req._id} value={req._id}>
                {req.requester} ({req.status})
              </option>
            ))}
          </select>

          <label>Supplier</label>
          <select
            style={inputStyle}
            value={form.supplierId}
            onChange={(e) =>
              setForm({
                ...form,
                supplierId: e.target.value,
                items: [{ itemId: "", quantity: 1, price: 0 }], // reset items when supplier changes
              })
            }
            required
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Column */}
        <div>
          <label>Item</label>
          <select
            style={inputStyle}
            value={form.items[0].itemId}
            onChange={(e) =>
              setForm({
                ...form,
                items: [{ ...form.items[0], itemId: e.target.value }],
              })
            }
            required
          >
            <option value="">-- Select Item --</option>
            {items.map((product, idx) => (
              <option key={idx} value={product}>
                {product}
              </option>
            ))}
          </select>

          <label>Quantity</label>
          <input
            style={inputStyle}
            type="number"
            min="1"
            value={form.items[0].quantity}
            onChange={(e) =>
              setForm({
                ...form,
                items: [
                  { ...form.items[0], quantity: Number(e.target.value) },
                ],
              })
            }
            required
          />

          <label>Price</label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            value={form.items[0].price}
            onChange={(e) =>
              setForm({
                ...form,
                items: [{ ...form.items[0], price: Number(e.target.value) }],
              })
            }
            required
          />
        </div>

        {/* Submit */}
        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Add Purchase Order
          </button>
        </div>
      </form>

      {/* LIST */}
      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: "15px", width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>Requester</th>
            <th>Supplier</th>
            <th>Items</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((po) => (
            <tr key={po._id}>
              <td>{po.requisitionId?.requester}</td>
              <td>{po.supplierId?.name}</td>
              <td>
                {po.items
                  .map(
                    (i) => `${i.itemId} (x${i.quantity}) ₱${i.price}`
                  )
                  .join(", ")}
              </td>
              <td>{po.status}</td>
              <td>
                {po.status === "draft" && (
                  <button
                    onClick={() => handleUpdateStatus(po._id, "sent")}
                  >
                    Send
                  </button>
                )}
                {po.status === "sent" && (
                  <button
                    onClick={() => handleUpdateStatus(po._id, "confirmed")}
                  >
                    Confirm
                  </button>
                )}
                <button onClick={() => handleDelete(po._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PurchaseOrders;
