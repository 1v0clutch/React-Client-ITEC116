import React, { useState } from "react";

export default function SupplyChainMain() {
  // --- States ---
  const [salesData, setSalesData] = useState([100, 120, 130, 90, 150]); // for forecasting
  const [forecast, setForecast] = useState(null);
  const [inventory, setInventory] = useState(500); // total current stock
  const [procurementLog, setProcurementLog] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [warehouses, setWarehouses] = useState({
    A: 200,
    B: 150,
    C: 150,
  });

  // --- 1. Demand Forecasting and Planning ---
  const analyzeData = () => {
    const avg = salesData.reduce((a, b) => a + b, 0) / salesData.length;
    const forecasted = Math.round(avg * 1.15); // growth trend
    setForecast(forecasted);
  };

  const adjustPlans = () => {
    if (!forecast) return alert("Run forecast first!");
    if (forecast > inventory) {
      alert("⚠️ High demand! Increase production or reorder stock.");
    } else {
      alert("✅ Demand meets supply. Maintain current plan.");
    }
  };

  // --- 2. Procurement and Supplier Coordination ---
  const placeAutoOrder = () => {
    if (inventory < 200) {
      const order = {
        supplier: "Global Raw Materials Co.",
        quantity: 300,
        eta: "3 days",
      };
      setProcurementLog([...procurementLog, order]);
      setInventory(inventory + order.quantity);
    } else {
      alert("Procurement not needed — stock level is sufficient.");
    }
  };

  const trackSuppliers = () => {
    if (procurementLog.length === 0) {
      alert("No active supplier orders.");
    } else {
      alert("📦 Supplier deliveries are on track!");
    }
  };

  // --- 3. Logistics and Transportation Management ---
  const planRoutes = () => {
    const route = ["Warehouse A ➜ City North", "Warehouse B ➜ City South"];
    setShipments(route);
    alert("🚚 Routes optimized and shipments planned.");
  };

  const trackShipments = () => {
    if (shipments.length === 0) {
      alert("No active shipments yet!");
    } else {
      alert("📍 Shipments currently in transit and being tracked.");
    }
  };

  const scheduleDeliveries = () => {
    alert("🕒 Inbound and outbound deliveries scheduled successfully.");
  };

  // --- 4. Inventory Distribution and Warehouse Coordination ---
  const monitorStock = () => {
    alert(
      `📦 Current Stock Levels — A:${warehouses.A}, B:${warehouses.B}, C:${warehouses.C}`
    );
  };

  const allocateToHighDemand = () => {
    const newStocks = { ...warehouses, A: warehouses.A - 30, B: warehouses.B + 30 };
    setWarehouses(newStocks);
    alert("✅ Stock reallocated to meet high demand in Warehouse B.");
  };

  const interWarehouseTransfer = () => {
    const transferQty = 20;
    setWarehouses({
      A: warehouses.A - transferQty,
      C: warehouses.C + transferQty,
      B: warehouses.B,
    });
    alert(`🔁 Transferred ${transferQty} units from A ➜ C`);
  };

  const reduceHoldingCosts = () => {
    const total = warehouses.A + warehouses.B + warehouses.C;
    const balanced = Math.floor(total / 3);
    setWarehouses({ A: balanced, B: balanced, C: balanced });
    alert("💰 Inventory rebalanced to minimize holding costs.");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 text-center mb-6">
        ERP Module 4: Supply Chain Management
      </h1>

      {/* --- Function 1 --- */}
      <section className="bg-white p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          1. Demand Forecasting and Planning
        </h2>
        <p>Past Sales Data: {salesData.join(", ")} units</p>
        <div className="space-x-2 mt-3">
          <button
            onClick={analyzeData}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Analyze Data
          </button>
          <button
            onClick={adjustPlans}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Adjust Plans
          </button>
        </div>
        {forecast && (
          <p className="mt-3 text-green-600 font-medium">
            📈 Forecasted Demand: {forecast} units
          </p>
        )}
      </section>

      {/* --- Function 2 --- */}
      <section className="bg-white p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          2. Procurement and Supplier Coordination
        </h2>
        <div className="space-x-2 mt-3">
          <button
            onClick={placeAutoOrder}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Auto-Order
          </button>
          <button
            onClick={trackSuppliers}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Track Suppliers
          </button>
        </div>
        {procurementLog.length > 0 && (
          <div className="mt-3">
            <p className="font-medium text-green-700">Active Orders:</p>
            <ul className="list-disc ml-6">
              {procurementLog.map((p, i) => (
                <li key={i}>
                  {p.quantity} units from {p.supplier} (ETA: {p.eta})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* --- Function 3 --- */}
      <section className="bg-white p-5 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          3. Logistics and Transportation Management
        </h2>
        <div className="space-x-2 mt-3">
          <button
            onClick={planRoutes}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Plan Routes
          </button>
          <button
            onClick={trackShipments}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Track Shipments
          </button>
          <button
            onClick={scheduleDeliveries}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Schedule Deliveries
          </button>
        </div>
        {shipments.length > 0 && (
          <ul className="list-disc ml-6 mt-3 text-green-700">
            {shipments.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </section>

      {/* --- Function 4 --- */}
      <section className="bg-white p-5 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          4. Inventory Distribution and Warehouse Coordination
        </h2>
        <div className="space-x-2 mt-3">
          <button
            onClick={monitorStock}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Monitor Stock
          </button>
          <button
            onClick={allocateToHighDemand}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Allocate to High Demand
          </button>
          <button
            onClick={interWarehouseTransfer}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Transfer Stock
          </button>
          <button
            onClick={reduceHoldingCosts}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            Optimize Costs
          </button>
        </div>
        <p className="mt-3 text-green-700 font-medium">
          📊 Warehouse A: {warehouses.A} | B: {warehouses.B} | C: {warehouses.C}
        </p>
      </section>
    </div>
  );
}
