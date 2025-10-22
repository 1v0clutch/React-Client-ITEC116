import React, { useEffect, useState } from "react";
import { getWarehouses, getInventorySummary, transferInventory } from "./SupplyChainMain";

export default function InventorySupplyChain() {
  const [warehouses, setWarehouses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getWarehouses().then(setWarehouses);
    getInventorySummary().then(setSummary);
  }, []);

  const handleTransfer = async () => {
    const res = await transferInventory(from, to, product, parseInt(qty));
    setMessage(`✅ Transfer complete! ${res.transferRecord.qty} units moved.`);
    getInventorySummary().then(setSummary);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🏭 Inventory & Warehouse Coordination</h2>

      <div className="flex flex-col gap-2 mb-6">
        <select className="border p-2 rounded" value={from} onChange={(e) => setFrom(e.target.value)}>
          <option value="">From Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select className="border p-2 rounded" value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">To Warehouse</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <input className="border p-2 rounded" placeholder="Product ID (e.g. p1)" value={product} onChange={(e) => setProduct(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} />
        <button onClick={handleTransfer} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          🔁 Transfer
        </button>
      </div>

      {message && <p className="text-green-700 font-medium">{message}</p>}

      <h3 className="font-semibold mt-6 mb-2">📦 Inventory Summary</h3>
      {summary.map((item) => (
        <div key={item.productId} className="border p-3 rounded mb-2 bg-white shadow">
          <p><b>{item.name}</b> — Total: {item.total}</p>
          <ul className="ml-4">
            {item.perWarehouse.map((w) => (
              <li key={w.warehouseId}>
                {w.name}: {w.qty}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
