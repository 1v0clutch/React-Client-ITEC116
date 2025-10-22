import React, { useEffect, useState } from "react";
import { getSuppliers, createOrder, autoReorderCheck } from "./SupplyChainMain";

export default function ProcurementSupplyChain() {
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSuppliers().then(setSuppliers);
  }, []);

  const handleOrder = async () => {
    const res = await createOrder(productId, parseInt(qty), supplierId);
    setMessage(`✅ Order Created: ${res.id}`);
  };

  const handleAuto = async () => {
    await autoReorderCheck();
    setMessage("✅ Auto Reorder Check Triggered!");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📦 Procurement & Supplier Coordination</h2>

      <div className="flex flex-col gap-2 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Product ID (e.g., p1)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Quantity"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={handleOrder} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          ➕ Create Order
        </button>
        <button onClick={handleAuto} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          ⚙️ Auto Reorder Check
        </button>
      </div>

      {message && <p className="font-medium text-green-700">{message}</p>}
    </div>
  );
}
