import { useState, useEffect } from "react";

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    requisitionId: "",
    supplierId: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    expectedDelivery: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      const [poRes, reqRes, supRes] = await Promise.all([
        fetch("http://localhost:8000/api/purchase-orders"),
        fetch("http://localhost:8000/api/requisitions"),
        fetch("http://localhost:8000/api/suppliers"),
      ]);

      const [pos, reqs, sups] = await Promise.all([
        poRes.json(),
        reqRes.json(),
        supRes.json(),
      ]);

      setPurchaseOrders(pos);
      setRequisitions(
        (reqs.data || reqs).filter((r) => r.status === "approved")
      );
      setSuppliers(sups.data || sups);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Fetch requisition details when selected
  const handleRequisitionSelect = async (id) => {
    setForm((prev) => ({ ...prev, requisitionId: id }));

    if (!id) return;

    try {
      const res = await fetch(`http://localhost:8000/api/requisitions/${id}`);
      const data = await res.json();

      // Autofill details from requisition
      setForm((prev) => ({
        ...prev,
        description: data.description || "",
        quantity: data.quantity || 1,
        unitPrice: data.unitPrice || "",
        expectedDelivery: data.expectedDelivery || data.deliveryDate || "",
      }));
    } catch (error) {
      console.error("Error fetching requisition details:", error);
    }
  };

  // Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const items = [
      {
        description: form.description,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        total: Number(form.quantity) * Number(form.unitPrice),
      },
    ];

    const body = {
      requisitionId: form.requisitionId,
      supplierId: form.supplierId,
      items,
      expectedDelivery: form.expectedDelivery,
      notes: form.notes,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:8000/api/purchase-orders/${editingId}`
      : "http://localhost:8000/api/purchase-orders";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("PO Response:", data);

      if (!res.ok) {
        alert("Error: " + (data.error || "Failed to save PO"));
        return;
      }

      await fetchData(); // refresh table
      setForm({
        requisitionId: "",
        supplierId: "",
        description: "",
        quantity: 1,
        unitPrice: "",
        expectedDelivery: "",
        notes: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while submitting the PO.");
    }
  };

  // Delete PO
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase order?")) return;
    await fetch(`http://localhost:8000/api/purchase-orders/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  // Edit PO
  const handleEdit = (po) => {
    setForm({
      requisitionId: po.requisitionId?._id || "",
      supplierId: po.supplierId?._id || "",
      description: po.items[0]?.description || "",
      quantity: po.items[0]?.quantity || 1,
      unitPrice: po.items[0]?.unitPrice || "",
      expectedDelivery: po.expectedDelivery || "",
      notes: po.notes || "",
    });
    setEditingId(po._id);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Purchase Order Management</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg shadow mb-6"
      >
        {/* Approved Requisition Dropdown */}
        <select
          className="border p-2 rounded"
          value={form.requisitionId}
          onChange={(e) => handleRequisitionSelect(e.target.value)}
          required
        >
          <option value="">Select Approved Requisition</option>
          {requisitions.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name} - {r.description}
            </option>
          ))}
        </select>

        {/* Supplier Dropdown */}
        <select
          className="border p-2 rounded"
          value={form.supplierId}
          onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Item Description */}
        <input
          type="text"
          placeholder="Item Description"
          className="border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        {/* Quantity */}
        <input
          type="number"
          placeholder="Quantity"
          className="border p-2 rounded"
          min="1"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          required
        />

        {/* Unit Price */}
        <input
          type="number"
          placeholder="Unit Price"
          className="border p-2 rounded"
          min="0"
          value={form.unitPrice}
          onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
          required
        />

        {/* Expected Delivery (auto-filled if available) */}
        <input
          type="date"
          className="border p-2 rounded"
          value={form.expectedDelivery}
          onChange={(e) =>
            setForm({ ...form, expectedDelivery: e.target.value })
          }
        />

        {/* Notes / Terms */}
        <textarea
          placeholder="Notes / Terms"
          className="border p-2 rounded col-span-full"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="col-span-full text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "Update PO" : "Create Purchase Order"}
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">PO #</th>
              <th className="p-2 border">Requisition</th>
              <th className="p-2 border">Supplier</th>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr key={po._id} className="hover:bg-gray-50">
                <td className="border p-2">{po.poNumber}</td>
                <td className="border p-2">{po.requisitionId?.name || "—"}</td>
                <td className="border p-2">{po.supplierId?.name || "—"}</td>
                <td className="border p-2">{po.items[0]?.description}</td>
                <td className="border p-2 text-center">
                  {po.items[0]?.quantity}
                </td>
                <td className="border p-2 text-right">
                  ₱{po.totalAmount?.toLocaleString()}
                </td>
                <td className="border p-2 text-center">{po.status}</td>
                <td className="border p-2 text-center">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(po)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(po._id)}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}