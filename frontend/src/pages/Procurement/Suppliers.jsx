import { useEffect, useState } from "react";

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/suppliers");
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (err) {
      console.error("Fetch suppliers error:", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:8000/api/suppliers/${editingId}`
      : "http://localhost:8000/api/suppliers";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save supplier");
      await fetchSuppliers();

      setForm({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        paymentTerms: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Submit supplier error:", err);
      alert("Error saving supplier.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    await fetch(`http://localhost:8000/api/suppliers/${id}`, { method: "DELETE" });
    fetchSuppliers();
  };

  const handleEdit = (s) => {
    setForm(s);
    setEditingId(s._id);
  };

  const filtered = suppliers.filter((s) =>
    [s.name, s.contactPerson, s.email, s.address]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <h2 className="text-2xl font-bold mb-6 border-b-2 pb-2">
        Supplier Management
      </h2>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-200"
      >
        <div>
          <label className="font-semibold text-gray-700">Supplier Name</label>
          <input
            type="text"
            placeholder="Enter supplier name"
            className="w-full border rounded p-2 mt-1  mb-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <label className="font-semibold text-gray-700">Contact Person</label>
          <input
            type="text"
            placeholder="Enter contact person"
            className="w-full border rounded p-2 mt-1 mb-3"
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
          />
          <label className="font-semibold text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full border rounded p-2 mt-1"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700">Phone Number</label>
          <input
            type="text"
            placeholder="Enter phone number"
            className="w-full border rounded p-2 mt-1 mb-3"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label className="font-semibold text-gray-700">Address</label>
          <input
            type="text"
            placeholder="Enter address"
            className="w-full border rounded p-2 mt-1 mb-3"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <label className="font-semibold text-gray-700">Payment Terms</label>
          <input
            type="text"
            placeholder="e.g. Net 30 Days"
            className="w-full border rounded p-2 mt-1"
            value={form.paymentTerms}
            onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
          />
        </div>

        <div className="col-span-full text-right mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-medium"
          >
            {editingId ? "Update Supplier" : "Add Supplier"}
          </button>
        </div>
      </form>

      {/* SEARCH BAR */}
      <div className="mb-4">
        <div className="flex items-center bg-white p-3 rounded-md shadow-sm border border-gray-200">
          <span className="text-gray-400 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SUPPLIER TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-2.5 border text-left">Name</th>
              <th className="p-2.5 border text-left">Contact Person</th>
              <th className="p-2.5 border text-left">Email</th>
              <th className="p-2.5 border text-left">Phone</th>
              <th className="p-2.5 border text-left">Payment Terms</th>
              <th className="p-2.5 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <td className="p-2 border">{s.name}</td>
                  <td className="p-2 border">{s.contactPerson}</td>
                  <td className="p-2 border">{s.email}</td>
                  <td className="p-2 border">{s.phone}</td>
                  <td className="p-2 border">{s.paymentTerms}</td>
                  <td className="p-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
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
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-4 italic"
                >
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
