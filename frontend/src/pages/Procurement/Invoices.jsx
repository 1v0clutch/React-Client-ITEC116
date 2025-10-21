import { useState, useEffect } from "react";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [form, setForm] = useState({
    poId: "",
    description: "",
    quantityReceived: "",
    receivedBy: "",
    condition: "Good",
    notes: "",
  });

  const fetchData = async () => {
    const [invRes, poRes] = await Promise.all([
      fetch("http://localhost:8000/api/invoices"),
      fetch("http://localhost:8000/api/purchase-orders"),
    ]);

    const [invData, poData] = await Promise.all([invRes.json(), poRes.json()]);
    setInvoices(invData.data || invData);
    setPurchaseOrders(poData.filter((p) => p.status !== "delivered"));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      poId: form.poId,
      receivedItems: [
        {
          description: form.description,
          quantityReceived: Number(form.quantityReceived),
          remarks: "",
        },
      ],
      receivedBy: form.receivedBy,
      condition: form.condition,
      notes: form.notes,
    };

    const res = await fetch("http://localhost:8000/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) return alert("Error: " + data.error);

    fetchData();
    setForm({
      poId: "",
      description: "",
      quantityReceived: "",
      receivedBy: "",
      condition: "Good",
      notes: "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await fetch(`http://localhost:8000/api/invoices/${id}`, {
      method: "DELETE",
    });
    fetchData();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Invoice Management (Goods Receipt)</h2>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-lg shadow mb-6"
      >
        <select
          className="border p-2 rounded"
          value={form.poId}
          onChange={(e) => setForm({ ...form, poId: e.target.value })}
          required
        >
          <option value="">Select Purchase Order</option>
          {purchaseOrders.map((po) => (
            <option key={po._id} value={po._id}>
              {po.poNumber} — {po.supplierId?.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Item Description"
          className="border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Quantity Received"
          className="border p-2 rounded"
          min="1"
          value={form.quantityReceived}
          onChange={(e) => setForm({ ...form, quantityReceived: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Received By"
          className="border p-2 rounded"
          value={form.receivedBy}
          onChange={(e) => setForm({ ...form, receivedBy: e.target.value })}
          required
        />

        <select
          className="border p-2 rounded"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          <option>Good</option>
          <option>Partial</option>
          <option>Damaged</option>
        </select>

        <textarea
          placeholder="Notes / Remarks"
          className="border p-2 rounded col-span-full"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="col-span-full text-right">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Submit Invoice
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">PO #</th>
              <th className="p-2 border">Received Items</th>
              <th className="p-2 border">Received By</th>
              <th className="p-2 border">Condition</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{r.poId?.poNumber}</td>
                <td className="border p-2">
                  {r.receivedItems.map((i, idx) => (
                    <div key={idx}>
                      {i.description} ({i.quantityReceived})
                    </div>
                  ))}
                </td>
                <td className="border p-2">{r.receivedBy}</td>
                <td className="border p-2">{r.condition}</td>
                <td className="border p-2">
                  {new Date(r.dateReceived).toLocaleDateString()}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}