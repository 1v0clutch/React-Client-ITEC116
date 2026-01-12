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
    await fetch(`http://localhost:8000/api/requisitions/${id}`, { method: "DELETE" });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Purchase Requisition & Approval</h2>
            <p className="text-white/80 text-sm">Submit & Manage Purchase Requests</p>
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
          <h3 className="text-xl font-bold text-gray-800">{editingId ? "Update Requisition" : "Create New Requisition"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requester Info Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-700">Requester Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Requester name"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  placeholder="Department"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Contact Details</label>
                <input
                  type="text"
                  placeholder="Contact information"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Item Details Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-700">Item / Service Details</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Item Description</label>
                <input
                  type="text"
                  placeholder="Item & Description"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col group">
                <label className="text-sm font-semibold text-gray-700 mb-2">Unit Price</label>
                <input
                  type="number"
                  placeholder="Unit Price"
                  step="0.01"
                  min="0"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={form.unitPrice}
                  onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Purpose and Budget Section */}
          <div className="flex flex-col group">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Purpose</label>
            </div>
            <textarea
              placeholder="Purpose of requisition"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 group-hover:border-orange-300 transition-all duration-200 bg-gray-50 focus:bg-white h-24 resize-none"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col group">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Budget / Cost Center</label>
            </div>
            <input
              type="text"
              placeholder="Budget / Cost Center"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 group-hover:border-red-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={form.budgetCode}
              onChange={(e) => setForm({ ...form, budgetCode: e.target.value })}
              required
            />
          </div>

          {/* Delivery Information */}
          <div className="flex flex-col group">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Delivery Date</label>
            </div>
            <input
              type="date"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 group-hover:border-cyan-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col group">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Delivery Location</label>
            </div>
            <input
              type="text"
              placeholder="Delivery Location"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 group-hover:border-teal-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={form.deliveryLocation}
              onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {editingId ? "Update Requisition" : "Submit Requisition"}
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search requisitions by name, department, description, purpose, or budget..."
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Requisitions</h3>
              <p className="text-white/80 text-sm">{filteredRequisitions.length} requisitions found</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredRequisitions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Requester</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Item Description</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Budget</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 font-medium text-gray-800">{r.name}</td>
                      <td className="py-4 px-4 text-gray-600">{r.department}</td>
                      <td className="py-4 px-4 text-gray-600">{r.description}</td>
                      <td className="py-4 px-4 text-gray-600">{r.purpose}</td>
                      <td className="py-4 px-4 text-gray-600">{r.budgetCode}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            r.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : r.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {r.status || "pending"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
                          {r.status === "pending" && (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleStatusUpdate(r._id, "approved")}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(r._id, "rejected")}
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2 justify-center mt-2 sm:mt-0">
                            <button
                              onClick={() => handleEdit(r)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r._id)}
                              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium px-3 py-1 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
          ) : (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No requisitions found</p>
              <p className="text-gray-400 mt-2">Create your first requisition or adjust your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
