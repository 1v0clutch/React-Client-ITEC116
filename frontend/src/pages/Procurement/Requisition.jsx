import { useState, useEffect } from "react";

export default function Requisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    department: "",
    contact: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    purpose: "",
    budgetCode: "",
    date: "",
    deliveryDate: "",
    deliveryLocation: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch requisitions
  const fetchRequisitions = () => {
    fetch("http://localhost:8000/api/requisitions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRequisitions(data);
        else setRequisitions([]);
      })
      .catch((err) => console.error("Error fetching requisitions:", err));
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  // Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:8000/api/requisitions/${editingId}`
      : "http://localhost:8000/api/requisitions";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        alert("Error: " + (data.message || "Failed to save requisition"));
        return;
      }

      fetchRequisitions();
      setForm({
        name: "",
        department: "",
        contact: "",
        description: "",
        quantity: 1,
        unitPrice: "",
        purpose: "",
        budgetCode: "",
        date: "",
        deliveryDate: "",
        deliveryLocation: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong while submitting.");
    }
  };

  // Update status
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/requisitions/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      const updated = await res.json();
      if (res.ok) {
        setRequisitions((prev) =>
          prev.map((r) => (r._id === id ? updated : r))
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Edit requisition
  const handleEdit = (req) => {
    setForm(req);
    setEditingId(req._id);
  };

  // Delete requisition
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    await fetch(
      `http://localhost:8000/api/requisitions/deleteRequisition/${id}`,
      { method: "DELETE" }
    );
    setRequisitions(requisitions.filter((r) => r._id !== id));
  };

  // ✅ Fixed search function
  const filteredRequisitions = requisitions.filter((r) => {
    const query = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(query) ||
      r.department?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.purpose?.toLowerCase().includes(query) ||
      r.budgetCode?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 min-h-screen bg-gray-50 text-gray-800">
      <h2 className="text-3xl font-bold mb-8 border-b-2 pb-2">
        Purchase Requisition & Approval
      </h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-200"
      >
        {/* Requester Info */}
        <div>
          <h3 className="font-semibold mb-3">
            Requester Information
          </h3>
          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Department"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Contact Details"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            required
          />
        </div>

        {/* Item Details */}
        <div>
          <h3 className="font-semibold mb-3">
            Item / Service Details
          </h3>
          <input
            type="text"
            placeholder="Item & Description"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            min="1"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Unit Price"
            step="0.01"
            min="0"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            required
          />
        </div>

        {/* Purpose and Budget */}
        <div>
          <h3 className="font-semibold mb-3">
            Purpose and Budget
          </h3>
          <textarea
            placeholder="Purpose"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Budget / Cost Center"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.budgetCode}
            onChange={(e) => setForm({ ...form, budgetCode: e.target.value })}
            required
          />
        </div>

        {/* Delivery Info */}
        <div>
          <h3 className="font-semibold mb-3">
            Delivery Information
          </h3>
          <input
            type="date"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.deliveryDate}
            onChange={(e) =>
              setForm({ ...form, deliveryDate: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Delivery Location"
            className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.deliveryLocation}
            onChange={(e) =>
              setForm({ ...form, deliveryLocation: e.target.value })
            }
            required
          />
        </div>

        {/* Submit */}
        <div className="col-span-full text-right mt-2">
          <button
            type="submit"
            className="bg-blue-700 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium shadow-sm"
          >
            {editingId ? "Update Requisition" : "Submit Requisition"}
          </button>
        </div>
      </form>

      {/* SEARCH BAR */}
      <div className="relative mb-5">
        <input
          type="text"
          placeholder="🔍 Search requisitions..."
          className="border border-gray-300 p-3 pl-10 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 border">Requester</th>
              <th className="p-3 border">Department</th>
              <th className="p-3 border">Item Description</th>
              <th className="p-3 border">Purpose</th>
              <th className="p-3 border">Budget</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.map((r) => (
              <tr
                key={r._id}
                className="hover:bg-blue-50 transition border-b last:border-none"
              >
                <td className="border p-3">{r.name}</td>
                <td className="border p-3">{r.department}</td>
                <td className="border p-3">{r.description}</td>
                <td className="border p-3">{r.purpose}</td>
                <td className="border p-3">{r.budgetCode}</td>
                <td
                  className={`border p-3 text-center font-medium ${
                    r.status === "approved"
                      ? "text-green-600"
                      : r.status === "rejected"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {r.status || "pending"}
                </td>
                <td className="border p-3 text-center">
                  <div className="flex flex-col sm:flex-row justify-center gap-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusUpdate(r._id, "approved")
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(r._id, "rejected")
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <div className="flex gap-2 justify-center mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEdit(r)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800 transition text-xs"
                      >
                        Delete
                      </button>
                    </div>
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
