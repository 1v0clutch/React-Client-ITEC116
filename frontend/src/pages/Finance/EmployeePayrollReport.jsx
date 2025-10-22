import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function EmployeePayrollReport() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setIsFetching(true);
        const res = await fetch("http://localhost:8000/api/finance/payroll-report");
        if (!res.ok) throw new Error("Failed to load payroll report");
        const payload = await res.json();
        if (!active) return;
        setData(Array.isArray(payload) ? payload : []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch payroll data");
        setData([]);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.dateProcessed || a.createdAt || 0).getTime();
      const dateB = new Date(b.dateProcessed || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [data]);

  const formatCurrency = (value) => {
    if (typeof value !== "number") return "—";
    return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "—";
  };

  const sanitize = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).replace(/"/g, '""');
  };

  const downloadFile = (content, mime, extension) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `payroll_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Pay Period",
      "Gross Pay",
      "Deductions",
      "Net Pay",
      "Date Processed",
    ];
    const rows = sortedData.map((row) => [
      `"${sanitize(row.employeeId || "—")}"`,
      `"${sanitize(row.name || "—")}"`,
      `"${sanitize(row.payPeriod || "—")}"`,
      formatCurrency(row.grossPay),
      formatCurrency(row.deductions),
      formatCurrency(row.netPay),
      `"${sanitize(formatDate(row.dateProcessed || row.createdAt))}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  const exportExcel = () => {
    const headers = [
      "Employee ID",
      "Name",
      "Pay Period",
      "Gross Pay",
      "Deductions",
      "Net Pay",
      "Date Processed",
    ];
    const rows = sortedData
      .map((row) => [
        sanitize(row.employeeId || "—"),
        sanitize(row.name || "—"),
        sanitize(row.payPeriod || "—"),
        formatCurrency(row.grossPay),
        formatCurrency(row.deductions),
        formatCurrency(row.netPay),
        sanitize(formatDate(row.dateProcessed || row.createdAt)),
      ])
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");
    const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    downloadFile(table, "application/vnd.ms-excel", "xls");
  };

  return (
    <FinanceLayout title="Employee Payroll Report">
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={isFetching || !sortedData.length}
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={exportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={isFetching || !sortedData.length}
        >
          Download Excel
        </button>
      </div>

      {error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
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
            {sortedData.length ? (
              sortedData.map((row, index) => (
                <tr key={row._id || index} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{row.employeeId || "—"}</td>
                  <td className="p-3">{row.name || "—"}</td>
                  <td className="p-3">{row.payPeriod || "—"}</td>
                  <td className="p-3 text-right">{formatCurrency(row.grossPay)}</td>
                  <td className="p-3 text-right">{formatCurrency(row.deductions)}</td>
                  <td className="p-3 text-right font-semibold text-green-700">{formatCurrency(row.netPay)}</td>
                  <td className="p-3 text-center">{formatDate(row.dateProcessed || row.createdAt)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={7}>
                  {isFetching ? "Loading payroll data..." : "No payroll data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </FinanceLayout>
  );
}
