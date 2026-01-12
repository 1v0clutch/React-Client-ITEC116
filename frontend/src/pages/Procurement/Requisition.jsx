import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  X,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Requisition() {
  const [requisitions, setRequisitions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    department: "",
    contact: "",
    description: "",
    quantity: "",
    unitPrice: "",
    purpose: "",
    budgetCode: "",
    date: "",
    deliveryDate: "",
    deliveryLocation: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong while submitting.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      department: "",
      contact: "",
      description: "",
      quantity: "",
      unitPrice: "",
      purpose: "",
      budgetCode: "",
      date: "",
      deliveryDate: "",
      deliveryLocation: "",
    });
    setEditingId(null);
  };

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

  const handleEdit = (req) => {
    setForm(req);
    setEditingId(req._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    await fetch(`http://localhost:8000/api/requisitions/${id}`, {
      method: "DELETE",
    });
    setRequisitions(requisitions.filter((r) => r._id !== id));
  };

  const filteredRequisitions = requisitions.filter((r) =>
    r.name?.toLowerCase().startsWith(search.toLowerCase())
  );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">

{/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
  <h2 className="text-3xl font-bold text-blue-800 tracking-tight">
    Procurement Requisition
  </h2>

  <div className="flex items-center gap-3">
    {/* 🟦 New Request Button (now first) */}
    <button
      onClick={() => {
        resetForm();
        setShowModal(true);
      }}
      className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg shadow-md transition-all"
    >
      <Plus size={18} /> New Request
    </button>

    {/* 🔹 Divider line for visual separation */}
    <div className="w-px h-6 bg-gray-300 mt-5" />

    {/* 👥 Suppliers Button (now second) */}
    <Link
      to="/procurement/suppliers"
      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition-all mt-4"
    >
      <Users size={18} /> Suppliers
    </Link>
  </div>
</div>
      {/* Search Bar */}
      <div className="mb-4 max-w-md">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
              type="text"
              placeholder="Search requester..."
              className="w-full bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-none shadow-lg border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-100 text-blue-900 text-sm uppercase">
            <tr>
              <th className="p-3 border text-center">Requester</th>
              <th className="p-3 border text-center">Department</th>
              <th className="p-3 border text-center">Item Description</th>
              <th className="p-3 border text-center">Purpose</th>
              <th className="p-3 border text-center">Budget</th>
              <th className="p-3 border text-center">Status</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.map((r) => (
              <tr
                key={r._id}
                className="hover:bg-blue-50 transition-colors border-b last:border-none"
              >
                <td className="border p-3 text-center font-medium text-gray-800">
                  {r.name}
                </td>
                <td className="border p-3 text-center">{r.department}</td>
                <td className="border p-3 text-center">{r.description}</td>
                <td className="border p-3 text-center">{r.purpose}</td>
                <td className="border p-3 text-center">{r.budgetCode}</td>
                <td className="border p-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      r.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status || "pending"}
                  </span>
                </td>
                <td className="border p-3 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(r._id, "approved")}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-xs font-medium"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(r._id, "rejected")}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-xs font-medium"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(r)}
                      className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-xs font-medium"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="flex items-center gap-1 bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-800 text-xs font-medium"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative animate-fade-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            >
              <X size={22} />
            </button>

            <h3 className="text-2xl font-semibold mb-6 text-blue-800">
              {editingId ? "Edit Requisition" : "New Requisition"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2"
            >
              {/* Requester Info */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Requester Name"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Department"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  required
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Contact #"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value.replace(/\D/g, "") })
                  }
                  required
                />
              </div>

              {/* Item Details */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Item Description"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({ ...form, unitPrice: e.target.value })
                  }
                  required
                />
              </div>

              {/* Purpose and Delivery */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <textarea
                    placeholder="Purpose"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Budget / Cost Center"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.budgetCode}
                    onChange={(e) =>
                      setForm({ ...form, budgetCode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.deliveryDate}
                    onChange={(e) =>
                      setForm({ ...form, deliveryDate: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Delivery Location"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.deliveryLocation}
                    onChange={(e) =>
                      setForm({ ...form, deliveryLocation: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 text-right mt-4">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition font-medium shadow-sm"
                >
                  {editingId ? "Update Requisition" : "Submit Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
