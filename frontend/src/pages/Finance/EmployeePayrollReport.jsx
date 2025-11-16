import React, { useEffect, useMemo, useState } from "react";

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
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
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

  const metrics = useMemo(() => {
    if (!sortedData.length) {
      return [
        { label: "Payroll Runs", value: "0" },
        { label: "Employees Paid", value: "0" },
        { label: "Total Gross Pay", value: formatCurrency(0) },
        { label: "Total Deductions", value: formatCurrency(0) },
        { label: "Total Net Pay", value: formatCurrency(0) },
      ];
    }
    const uniqueEmployees = new Set(
      sortedData.map((row) => row.employeeId || row.name || row._id || "")
    );
    const totalGross = sortedData.reduce((sum, row) => {
      return sum + (typeof row.grossPay === "number" ? row.grossPay : 0);
    }, 0);
    const totalNet = sortedData.reduce((sum, row) => {
      return sum + (typeof row.netPay === "number" ? row.netPay : 0);
    }, 0);
    const totalDeductions = sortedData.reduce((sum, row) => {
      return sum + (typeof row.deductions === "number" ? row.deductions : 0);
    }, 0);
    return [
      { label: "Payroll Runs", value: sortedData.length.toLocaleString() },
      { label: "Employees Paid", value: uniqueEmployees.size.toLocaleString() },
      { label: "Total Gross Pay", value: formatCurrency(totalGross) },
      { label: "Total Deductions", value: formatCurrency(totalDeductions) },
      { label: "Total Net Pay", value: formatCurrency(totalNet) },
    ];
  }, [sortedData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Employee Payroll (HR)</h1>
        <p className="text-lg text-slate-600">Manage employee payroll and compensation</p>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-emerald-600">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={isFetching || !sortedData.length}
            >
              Download CSV
            </button>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-600">
              {error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                <thead className="bg-blue-100 text-blue-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Employee ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Pay Period</th>
                    <th className="px-4 py-3 text-right font-semibold">Gross Pay</th>
                    <th className="px-4 py-3 text-right font-semibold">Deductions</th>
                    <th className="px-4 py-3 text-right font-semibold">Net Pay</th>
                    <th className="px-4 py-3 text-center font-semibold">Date Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedData.length ? (
                    sortedData.map((row, index) => (
                      <tr key={row._id || index} className="transition hover:bg-blue-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{row.employeeId || "—"}</td>
                        <td className="px-4 py-3">{row.name || "—"}</td>
                        <td className="px-4 py-3">{row.payPeriod || "—"}</td>
                        <td className="px-4 py-3 text-right text-blue-700 font-semibold">
                          {formatCurrency(row.grossPay)}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-700 font-semibold">
                          {formatCurrency(row.deductions)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                          {formatCurrency(row.netPay)}
                        </td>
                        <td className="px-4 py-3 text-center">{formatDate(row.dateProcessed || row.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={7}>
                        {isFetching ? "Loading payroll data..." : "No payroll data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
