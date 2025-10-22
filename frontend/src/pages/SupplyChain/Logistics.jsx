import React, { useEffect, useState } from "react";
import { getShipments, updateShipment } from "./SupplyChainMain";

export default function Logistics() {
  const [shipments, setShipments] = useState([]);
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const loadShipments = async () => {
    const data = await getShipments();
    setShipments(data);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleUpdate = async () => {
    await updateShipment(selectedId, status, location);
    await loadShipments();
    alert("✅ Shipment updated!");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🚚 Logistics & Transportation</h2>
      <select
        className="border p-2 rounded mb-4"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        <option value="">Select Shipment</option>
        {shipments.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} - {s.status}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="New Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="New Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        🔄 Update Shipment
      </button>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">📋 Current Shipments</h3>
        {shipments.map((s) => (
          <div key={s.id} className="border rounded p-3 mb-2 bg-white shadow">
            <p><b>ID:</b> {s.id}</p>
            <p><b>Status:</b> {s.status}</p>
            <p><b>Location:</b> {s.currentLocation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
