import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Search } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);

  const firstInputRef = useRef(null);

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
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Submit supplier error:", err);
      alert("Error saving supplier.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      paymentTerms: "",
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    await fetch(`http://localhost:8000/api/suppliers/${id}`, { method: "DELETE" });
    fetchSuppliers();
  };

  const handleEdit = (s) => {
    setForm(s);
    setEditingId(s._id);
    setShowModal(true);
  };

  const filtered = suppliers.filter((s) =>
    [s.name, s.contactPerson, s.email, s.address]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (showModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showModal]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-blue-800">Supplier Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg shadow transition-all"
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 max-w-md">
        <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search suppliers..."
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="p-3 border text-center">Name</th>
              <th className="p-3 border text-center">Contact Person</th>
              <th className="p-3 border text-center">Email</th>
              <th className="p-3 border text-center">Phone</th>
              <th className="p-3 border text-center">Payment Terms</th>
              <th className="p-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <td className="p-3 border text-center">{s.name}</td>
                  <td className="p-3 border text-center">{s.contactPerson}</td>
                  <td className="p-3 border text-center">{s.email}</td>
                  <td className="p-3 border text-center">{s.phone}</td>
                  <td className="p-3 border text-center">{s.paymentTerms}</td>
                  <td className="p-3 border text-center">
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
                <td colSpan="6" className="text-center text-gray-500 py-4 italic">
                  No suppliers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 transition-opacity duration-300"
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-8 relative transform scale-90 opacity-0 transition-all duration-300 animate-modal-in"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-semibold mb-6 text-blue-800">
              {editingId ? "Edit Supplier" : "New Supplier"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Supplier Name"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  ref={firstInputRef}
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="Contact #"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                  }
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Payment Terms"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                />
              </div>

              <div className="col-span-full text-right mt-4">
                <button
                  type="submit"
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-medium"
                >
                  {editingId ? "Update Supplier" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-modal-in {
          transform: scale(1);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
