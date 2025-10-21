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

  //Fetch requisitions
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

  //Submit form (Add or Update)
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

      fetchRequisitions(); //Refresh
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

  //Update status
  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/requisitions/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
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

  //Delete
  {/*const handleDelete = async (id) => {
    if (!window.confirm("Delete this requisition?")) return;
    await fetch(`http://localhost:8000/api/requisitions/${id}`, {
      method: "DELETE",
    });
    setRequisitions((prev) => prev.filter((r) => r._id !== id));
  };*/}

  //Edit
  const handleEdit = (req) => {
    setForm(req);
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Purchase Requisition & Approval</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg shadow-md mb-6"
      >
        {/* Requester Info */}
        <div>
          <h3 className="font-semibold mb-2">Requester Information</h3>
          <input
            type="text"
            placeholder="Name"
            className="w-full border rounded p-2 mb-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Department"
            className="w-full border rounded p-2 mb-2"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Contact Details"
            className="w-full border rounded p-2 mb-2"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            required
          />
        </div>

        {/* Item Details */}
        <div>
          <h3 className="font-semibold mb-2">Item / Service Details</h3>
          <input
            type="text"
            placeholder="Description"
            className="w-full border rounded p-2 mb-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            min="1"
            className="w-full border rounded p-2 mb-2"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Unit Price"
            step="0.01"
            min="0"
            className="w-full border rounded p-2 mb-2"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            required
          />
        </div>

        {/* Purpose and Budget */}
        <div>
          <h3 className="font-semibold mb-2">Purpose and Budget</h3>
          <textarea
            placeholder="Purpose"
            className="w-full border rounded p-2 mb-2"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Budget / Cost Center"
            className="w-full border rounded p-2 mb-2"
            value={form.budgetCode}
            onChange={(e) => setForm({ ...form, budgetCode: e.target.value })}
            required
          />
          <input
            type="date"
            className="w-full border rounded p-2 mb-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Delivery Info */}
        <div>
          <h3 className="font-semibold mb-2">Delivery Information</h3>
          <input
            type="date"
            className="w-full border rounded p-2 mb-2"
            value={form.deliveryDate}
            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Delivery Location"
            className="w-full border rounded p-2 mb-2"
            value={form.deliveryLocation}
            onChange={(e) =>
              setForm({ ...form, deliveryLocation: e.target.value })
            }
            required
          />
        </div>

        {/* Submit */}
        <div className="col-span-full text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "Update Requisition" : "Submit Requisition"}
          </button>
        </div>
      </form>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search requisitions..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Requester</th>
              <th className="p-2 border">Department</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Purpose</th>
              <th className="p-2 border">Budget</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequisitions.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.department}</td>
                <td className="border p-2">{r.description}</td>
                <td className="border p-2">{r.purpose}</td>
                <td className="border p-2">{r.budgetCode}</td>
                <td className="border p-2 text-center text-gray-700 font-medium">
                  {r.status || "pending"}
                </td>

                {/* Buttons aligned & uniform */}
                <td className="border p-2">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(r._id, "approved")}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(r._id, "rejected")}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(r)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
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
