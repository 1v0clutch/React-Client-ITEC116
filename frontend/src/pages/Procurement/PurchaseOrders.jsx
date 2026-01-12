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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Purchase Order Management</h2>
            <p className="text-white/80 text-sm">Create & Manage Purchase Orders</p>
          </div>
        </div>
      </div>

      {/* Enhanced Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{editingId ? "Update Purchase Order" : "Create New Purchase Order"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Approved Requisition Dropdown */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Approved Requisition
            </label>
            <select
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
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
          </div>

          {/* Supplier Dropdown */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Supplier
            </label>
            <select
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
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
          </div>

          {/* Item Description */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Item Description
            </label>
            <input
              type="text"
              placeholder="Item Description"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Quantity
            </label>
            <input
              type="number"
              placeholder="Quantity"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>

          {/* Unit Price */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Unit Price
            </label>
            <input
              type="number"
              placeholder="Unit Price"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              required
            />
          </div>

          {/* Expected Delivery */}
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Expected Delivery
            </label>
            <input
              type="date"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={form.expectedDelivery}
              onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
            />
          </div>

          {/* Notes / Terms */}
          <div className="md:col-span-2 flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes / Terms
            </label>
            <textarea
              placeholder="Additional notes or terms"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 group-hover:border-cyan-300 transition-all duration-200 bg-gray-50 focus:bg-white h-24 resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {editingId ? "Update Purchase Order" : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced Purchase Orders Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Purchase Orders</h3>
              <p className="text-white/80 text-sm">{purchaseOrders.length} active orders</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No purchase orders yet</p>
              <p className="text-gray-400 mt-2">Create your first purchase order above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">PO #</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Requisition</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Supplier</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Qty</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {po.poNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{po.requisitionId?.name || "—"}</td>
                      <td className="py-4 px-4 text-gray-600">{po.supplierId?.name || "—"}</td>
                      <td className="py-4 px-4 text-gray-600">{po.items[0]?.description}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {po.items[0]?.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                          ₱{po.totalAmount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          po.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          po.status === 'approved' ? 'bg-green-100 text-green-800' :
                          po.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(po)}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(po._id)}
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
          )}
        </div>
      </div>
    </div>
  );
}