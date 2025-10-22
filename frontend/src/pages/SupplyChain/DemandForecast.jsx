import React, { useEffect, useState } from "react";
import { getInventorySummary, forecastDemand, analyzeStockLevels } from "./SupplyChainMain";

export default function DemandForecast() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    getInventorySummary().then(setInventory);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Demand Forecasting & Planning</h2>
      {inventory.map((item) => {
        const salesSample = [{ qty: 10 }, { qty: 12 }, { qty: 9 }, { qty: 11 }, { qty: 15 }];
        const forecastValue = forecastDemand(salesSample);
        const status = analyzeStockLevels(item.total, forecastValue);
        return (
          <div key={item.productId} className="border p-4 rounded-xl shadow mb-4 bg-white">
            <h3 className="font-semibold">{item.name}</h3>
            <p>Current Stock: {item.total}</p>
            <p>Forecasted Demand: {forecastValue}</p>
            <p>Status: <span className="font-medium">{status}</span></p>
          </div>
        );
      })}
    </div>
  );
}
