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
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Invoice Management (Goods Receipt)
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow mb-6"
      >
        <select
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Quantity Received"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          value={form.quantityReceived}
          onChange={(e) => setForm({ ...form, quantityReceived: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Received By"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.receivedBy}
          onChange={(e) => setForm({ ...form, receivedBy: e.target.value })}
          required
        />

        <select
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
        >
          <option>Good</option>
          <option>Partial</option>
          <option>Damaged</option>
        </select>

        <textarea
          placeholder="Notes / Remarks"
          className="border border-gray-300 p-3 rounded-md col-span-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="col-span-full text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Invoice
          </button>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">PO #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Received Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Received By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Condition</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{r.poId?.poNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.receivedItems.map((i, idx) => (
                      <div key={idx}>
                        {i.description} ({i.quantityReceived})
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.receivedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{r.condition}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(r.dateReceived).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
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
    </div>
  );
}