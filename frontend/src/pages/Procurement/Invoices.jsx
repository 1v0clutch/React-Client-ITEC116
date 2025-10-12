import { useState, useEffect } from "react";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    purchaseOrderId: "",
    supplierId: "",
    invoiceNumber: "",
    items: [{ itemId: "", quantity: 1, unitPrice: 0 }],
    remarks: "",
  });
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch purchase orders for dropdown
  useEffect(() => {
    fetch("http://localhost:8000/api/purchase-orders/getPurchaseOrder")
      .then((res) => res.json())
      .then((data) => setPurchaseOrders(data))
      .catch((err) => console.error("Error fetching POs:", err));
  }, []);

  // Fetch invoices
  useEffect(() => {
    fetch("http://localhost:8000/api/invoices/getInvoice")
      .then((res) => res.json())
      .then((data) => setInvoices(data))
      .catch((err) => console.error("Error fetching invoices:", err));
  }, []);

  // Fetch suppliers and purchase orders
  useEffect(() => {
    fetch("http://localhost:8000/api/suppliers/getSupplier")
      .then((res) => res.json())
      .then((data) => setSuppliers(data));

    fetch("http://localhost:8000/api/purchase-orders/getPurchaseOrder")
      .then((res) => res.json())
      .then((data) => setPurchaseOrders(data));
  }, []);

  // Fetch items from supplier if supplierId is manually changed
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

  // Auto–fill supplier + items when purchase order is selected
  useEffect(() => {
    if (form.purchaseOrderId) {
      const selectedPO = purchaseOrders.find(
        (po) => po._id === form.purchaseOrderId
      );
      if (selectedPO) {
        setForm((prev) => ({
          ...prev,
          supplierId: selectedPO.supplierId?._id || "",
          items: selectedPO.items.map((i) => ({
            itemId: i.itemId, // product name string
            quantity: i.quantity,
            unitPrice: i.price || 0,
          })),
        }));

        // also set items dropdown options
        if (selectedPO.supplierId?._id) {
          fetch(
            `http://localhost:8000/api/suppliers/${selectedPO.supplierId._id}/products`
          )
            .then((res) => res.json())
            .then((data) => setItems(data));
        }
      }
    }
  }, [form.purchaseOrderId, purchaseOrders]);

  const calcTotal = () =>
    form.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  // Add / Update Invoice
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      totalAmount: calcTotal(),
    };

    try {
      if (editingId) {
        const res = await fetch(
          `http://localhost:8000/api/invoices/updateInvoice/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const updated = await res.json();
        if (!res.ok) return alert("Error: " + updated.error);
        setInvoices(
          invoices.map((inv) => (inv._id === editingId ? updated : inv))
        );
        setEditingId(null);
      } else {
        const res = await fetch(
          "http://localhost:8000/api/invoices/addInvoice",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const newInv = await res.json();
        if (!res.ok) return alert("Error: " + newInv.error);
        setInvoices([...invoices, newInv]);
      }

      const res = await fetch("http://localhost:8000/api/invoices/addInvoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const newInvoice = await res.json();
      if (!res.ok) return alert("Error: " + newInvoice.error);

      setInvoices([...invoices, newInvoice.invoice || newInvoice]); // invoice may be wrapped
      setForm({
        purchaseOrderId: "",
        supplierId: "",
        invoiceNumber: "",
        items: [{ itemId: "", quantity: 1, unitPrice: 0 }],
        remarks: "",
      });
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  // Edit Invoice
  const handleEdit = (inv) => {
    setForm({
      purchaseOrderId: inv.purchaseOrderId?._id || "",
      supplierId: inv.supplierId?._id || "",
      invoiceNumber: inv.invoiceNumber,
      items: inv.items || [{ itemId: "", quantity: 1, unitPrice: 0 }],
      remarks: inv.remarks || "",
    });
    setEditingId(inv._id);
  };

  // Delete Invoice
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await fetch(`http://localhost:8000/api/invoices/deleteInvoice/${id}`, {
      method: "DELETE",
    });
    setInvoices(invoices.filter((inv) => inv._id !== id));
  };

  // Update Invoice Status
  const handleStatusUpdate = async (id, status) => {
    const res = await fetch(
      `http://localhost:8000/api/invoices/updateInvoiceStatus/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    const updated = await res.json();
    setInvoices(invoices.map((inv) => (inv._id === id ? updated : inv)));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoices</h2>

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
        <div>
          <label>Purchase Order</label>
          <select
            style={inputStyle}
            value={form.purchaseOrderId}
            onChange={(e) =>
              setForm({ ...form, purchaseOrderId: e.target.value })
            }
            required
          >
            <option value="">-- Select PO --</option>
            {purchaseOrders.map((po) => (
              <option key={po._id} value={po._id}>
                {po._id} ({po.status})
              </option>
            ))}
          </select>

          <label>Supplier</label>
          <select
            style={inputStyle}
            value={form.supplierId}
            onChange={(e) =>
              setForm({ ...form, supplierId: e.target.value })
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

          <label>Invoice Number</label>
          <input
            style={inputStyle}
            value={form.invoiceNumber}
            onChange={(e) =>
              setForm({ ...form, invoiceNumber: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Items</label>
          {form.items.map((it, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <select
                style={{ ...inputStyle, marginBottom: "5px" }}
                value={it.itemId}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[idx].itemId = e.target.value;
                  setForm({ ...form, items: newItems });
                }}
                required
              >
                <option value="">-- Select Item --</option>
                {items.map((product, idx) => (
                  <option key={idx} value={product}>
                    {product}
                  </option>
                ))}
              </select>
              <input
                type="number"
                style={inputStyle}
                placeholder="Quantity"
                min="1"
                value={it.quantity}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[idx].quantity = Number(e.target.value);
                  setForm({ ...form, items: newItems });
                }}
                required
              />
              <input
                type="number"
                style={inputStyle}
                placeholder="Unit Price"
                min="0"
                value={it.unitPrice}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[idx].unitPrice = Number(e.target.value);
                  setForm({ ...form, items: newItems });
                }}
                required
              />
            </div>
          ))}
        </div>

        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
          <p>
            <b>Total:</b> ₱{calcTotal()}
          </p>
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
            {editingId ? "Update Invoice" : "Add Invoice"}
          </button>
        </div>
      </form>

      {/* LIST */}
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>Invoice #</th>
            <th>PO</th>
            <th>Supplier</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.invoiceNumber}</td>
              <td>{inv.purchaseOrderId?._id}</td>
              <td>{inv.supplierId?.name}</td>
              <td>₱{inv.totalAmount}</td>
              <td>{inv.status}</td>
              <td>
                <button onClick={() => handleEdit(inv)}>Edit</button>
                <button onClick={() => handleDelete(inv._id)}>Delete</button>
                {["approved", "paid"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(inv._id, st)}
                  >
                    {st}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Invoices;
