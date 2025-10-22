import React, { useEffect, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function EmployeePayrollReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:8000/api/finance/payroll-report")
        .then((res) => {
          if (!res.ok) throw new Error("Network error");
          return res.json();
        })
        .then(setData)
        .catch((err) => {
          console.error("Fetch error:", err);
          setData([]);
        });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <FinanceLayout title="Employee Payroll Report">
      <table className="min-w-full border border-gray-300 text-sm text-gray-700">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-3 text-left">Employee ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Pay Period</th>
            <th className="p-3 text-right">Gross Pay</th>
            <th className="p-3 text-right">Deductions</th>
            <th className="p-3 text-right">Net Pay</th>
            <th className="p-3 text-center">Date Processed</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50 transition">
                <td className="p-3">{row.employeeId}</td>
                <td className="p-3">{row.name}</td>
                <td className="p-3">{row.payPeriod}</td>
                <td className="p-3 text-right">₱{row.grossPay?.toLocaleString()}</td>
                <td className="p-3 text-right">₱{row.deductions?.toLocaleString()}</td>
                <td className="p-3 text-right font-semibold text-green-700">
                  ₱{row.netPay?.toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  {new Date(row.dateProcessed).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan="7">
                No payroll data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </FinanceLayout>
  );
}
