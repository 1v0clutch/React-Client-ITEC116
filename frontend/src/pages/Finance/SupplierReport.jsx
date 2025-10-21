import React, { useEffect, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function SupplierReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/api/finance/supplier-report")
        .then((res) => res.json())
        .then(setData)
        .catch(console.error);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FinanceLayout title="Supplier Report">
      <table className="min-w-full border border-gray-300 text-sm text-gray-700">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3 text-left">PO #</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-right">Total</th>
            <th className="p-3 text-center">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((po) => (
              <tr key={po._id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{po.supplierId?.name || "—"}</td>
                <td className="p-3">{po.poNumber}</td>
                <td className="p-3 text-center">{po.status || "—"}</td>
                <td className="p-3 text-right">₱{po.totalAmount?.toLocaleString()}</td>
                <td className="p-3 text-center">
                  {new Date(po.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan="5">
                No supplier data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </FinanceLayout>
  );
}
