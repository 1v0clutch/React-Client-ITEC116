import { useState, useEffect } from "react";

function Requisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);   // ✅ Suppliers list
  const [items, setItems] = useState([]);           // ✅ Products from selected supplier
  const [form, setForm] = useState({
    requester: "",
    supplierId: "",
    items: [{ itemId: "", quantity: 1 }],
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

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
      .then(res => res.json())
      .then(data => setRequisitions(data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Fetch suppliers
  useEffect(() => {
    fetch("http://localhost:8000/api/suppliers/getSupplier")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // ✅ Fetch products from selected supplier
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

  // Add / Update requisition
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/requisitions/addRequisition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const newReq = await res.json();
      if (!res.ok) return alert("Error: " + newReq.error);
      setRequisitions([...requisitions, newReq]);
      setForm({ requester: "", items: [{ itemId: "", quantity: 1 }] });
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  // Edit requisition
  const handleEdit = (req) => {
    setForm({
      requester: req.requester,
      supplierId: req.supplierId || "",
      items: req.items.length > 0 ? req.items : [{ itemId: "", quantity: 1 }],
    });
    setEditingId(req._id);
  };

  // Approve / Reject requisition
  const handleUpdateStatus = async (id, status) => {
    const res = await fetch(`http://localhost:8000/api/requisitions/updateRequisition/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setRequisitions(requisitions.map((r) => (r._id === id ? updated : r)));
  };

  // Delete requisition
  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/api/requisitions/deleteRequisition/${id}`, { method: "DELETE" });
    setRequisitions(requisitions.filter(r => r._id !== id));
  };

  // Filter requisitions by search
  const filteredRequisitions = requisitions.filter((r) => {
    const query = search.toLowerCase();
    return (
      (r.requester || "").toLowerCase().includes(query) ||
      r.items.some((i) =>
        (i.itemId || "").toLowerCase().includes(query)
      )
    );
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Purchase Requisition</h2>

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
        {/* Left column */}
        <div>
          <label>Requester</label>
          <input
            style={inputStyle}
            value={form.requester}
            onChange={(e) => setForm({ ...form, requester: e.target.value })}
            required
          />

          <label>Supplier</label>
          <select
            style={inputStyle}
            value={form.supplierId}
            onChange={(e) =>
              setForm({ ...form, supplierId: e.target.value, items: [{ itemId: "", quantity: 1 }] })
            }
            required
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

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
        </div>

        {/* Right column */}
        <div>
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
        </div>

        {/* Submit button */}
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
            {editingId ? "Update Requisition" : "Add Requisition"}
          </button>
        </div>
      </form>

      {/* SEARCH */}
      <input
        style={inputStyle}
        placeholder="Search by requester or item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LIST */}
      <table
        border="1"
        cellPadding="8"
        style={{
          marginTop: "15px",
          width: "100%",
          borderCollapse: "collapse",
        }}
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
          {filteredRequisitions.map((r) => (
            <tr key={r._id}>
              <td>{r.requester}</td>
              <td>{suppliers.find(s => s._id === r.supplierId)?.name || r.supplierId}</td>
              <td>
                {r.items
                  .map((i) => `${i.itemId} (x${i.quantity})`)
                  .join(", ")}
              </td>
              <td>{r.status}</td>
              <td>
                {r.status === "pending" && (
                  <>
                    <button onClick={() => handleUpdateStatus(r._id, "approved")}>
                      Approve
                    </button>
                    <button onClick={() => handleUpdateStatus(r._id, "rejected")}>
                      Reject
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(r._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Requisition;
