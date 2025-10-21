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
      <h2 className="text-2xl font-bold mb-6">Supplier Management</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg shadow-md mb-6"
      >
        <input
          type="text"
          placeholder="Supplier Name"
          className="border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Contact Person"
          className="border p-2 rounded"
          value={form.contactPerson}
          onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="border p-2 rounded"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          className="border p-2 rounded col-span-full"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Payment Terms"
          className="border p-2 rounded col-span-full"
          value={form.paymentTerms}
          onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
        />
        <div className="col-span-full text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "Update Supplier" : "Add Supplier"}
          </button>
        </div>
      </form>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search suppliers..."
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Contact Person</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Payment Terms</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.contactPerson}</td>
                <td className="border p-2">{s.email}</td>
                <td className="border p-2">{s.phone}</td>
                <td className="border p-2">{s.paymentTerms}</td>
                <td className="border p-2 text-center">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleEdit(s)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
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
