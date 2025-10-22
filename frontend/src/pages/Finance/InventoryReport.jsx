import React, { useEffect, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function InventoryReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/api/finance/inventory-transactions")
        .then((res) => res.json())
        .then(setData)
        .catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FinanceLayout title="Inventory Transactions">
      <table className="min-w-full border border-gray-300 text-sm text-gray-700">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-center">Type</th>
            <th className="p-3 text-right">Quantity</th>
            <th className="p-3 text-left">Remarks</th>
            <th className="p-3 text-left">Purchase Order</th>
            <th className="p-3 text-center">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((tx, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{tx.item}</td>
                <td className="p-3 text-center">{tx.type}</td>
                <td className="p-3 text-right">{tx.quantity}</td>
                <td className="p-3">{tx.remarks}</td>
                <td className="p-3">{tx.purchaseOrderId || "—"}</td>
                <td className="p-3 text-center">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan="6">
                No inventory data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </FinanceLayout>
  );
}
