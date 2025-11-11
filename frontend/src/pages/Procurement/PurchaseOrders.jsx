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
  const [showModal, setShowModal] = useState(false);

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

  const handleRequisitionSelect = async (id) => {
    setForm((prev) => ({ ...prev, requisitionId: id }));
    if (!id) return;

    try {
      const res = await fetch(`http://localhost:8000/api/requisitions/${id}`);
      const data = await res.json();

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
      if (!res.ok) {
        alert("Error: " + (data.error || "Failed to save PO"));
        return;
      }

      await fetchData();
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
      setShowModal(false);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while submitting the PO.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase order?")) return;
    await fetch(`http://localhost:8000/api/purchase-orders/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

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
    setShowModal(true);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-gray-800">
      <h2 className="text-3xl font-bold mb-6 border-b-2 pb-2 text-blue-800">
        Purchase Orders
      </h2>

      {/* CREATE / EDIT BUTTON */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {editingId ? "Edit PO" : "Create Purchase Order"}
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 border text-center">PO #</th>
              <th className="p-3 border text-center">Requisition</th>
              <th className="p-3 border text-center">Supplier</th>
              <th className="p-3 border text-center">Item</th>
              <th className="p-3 border text-center">Qty</th>
              <th className="p-3 border text-center">Total</th>
              <th className="p-3 border text-center">Status</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.length > 0 ? (
              purchaseOrders.map((po) => (
                <tr
                  key={po._id}
                  className="hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <td className="border p-3 text-center">{po.poNumber}</td>
                  <td className="border p-3 text-center">
                    {po.requisitionId?.name || "—"}
                  </td>
                  <td className="border p-3 text-center">
                    {po.supplierId?.name || "—"}
                  </td>
                  <td className="border p-3 text-center">{po.items[0]?.description}</td>
                  <td className="border p-3 text-center">{po.items[0]?.quantity}</td>
                  <td className="border p-3 text-center">
                    ₱{po.totalAmount?.toLocaleString()}
                  </td>
                  <td className="border p-3 text-center">{po.status}</td>
                  <td className="border p-3 text-center">
                    <div className="flex justify-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleEdit(po)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(po._id)}
                        className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-800 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 italic text-gray-500">
                  No purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
              }}
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold mb-6 text-blue-800">
              {editingId ? "Edit Purchase Order" : "Create Purchase Order"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <select
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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

              <select
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.supplierId}
                onChange={(e) =>
                  setForm({ ...form, supplierId: e.target.value })
                }
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Item Description"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none col-span-full"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Unit Price"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="0"
                value={form.unitPrice}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: e.target.value })
                }
                required
              />

              <input
                type="date"
                className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.expectedDelivery}
                onChange={(e) =>
                  setForm({ ...form, expectedDelivery: e.target.value })
                }
              />

              <textarea
                placeholder="Notes / Terms"
                className="border p-3 rounded-lg col-span-full focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <div className="col-span-full text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingId ? "Update PO" : "Create PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
