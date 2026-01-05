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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Employee Payroll Report</h1>
            <p className="text-white/80 text-sm">Comprehensive payroll data and compensation analytics</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        {/* Enhanced Metrics Section */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payroll Analytics</h2>
              <p className="text-white/80 text-sm">Key metrics and performance indicators</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  index === 0 ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100' :
                  index === 1 ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' :
                  index === 2 ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100' :
                  index === 3 ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100' :
                  'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`rounded-xl p-2 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-purple-500' :
                    index === 3 ? 'bg-orange-500' :
                    'bg-emerald-500'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {index === 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      ) : index === 1 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      ) : index === 2 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : index === 3 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <p className={`text-sm font-semibold uppercase tracking-wide ${
                    index === 0 ? 'text-blue-700' :
                    index === 1 ? 'text-green-700' :
                    index === 2 ? 'text-purple-700' :
                    index === 3 ? 'text-orange-700' :
                    'text-emerald-700'
                  }`}>
                    {metric.label}
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Export Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Export Data</h3>
                  <p className="text-sm text-gray-600">Download payroll report in CSV format</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={exportCsv}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isFetching || !sortedData.length}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          </div>

          {/* Enhanced Data Table */}
          {error ? (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 border-2 border-red-200">
              <div className="flex items-center justify-center gap-3">
                <div className="bg-red-500 rounded-xl p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">Error Loading Data</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Payroll Records</h3>
                    <p className="text-white/80 text-sm">{sortedData.length} records found</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Employee ID
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Name
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                          </svg>
                          Pay Period
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Gross Pay
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                          Deductions
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Net Pay
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7" />
                          </svg>
                          Date Processed
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length ? (
                      sortedData.map((row, index) => (
                        <tr key={row._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {row.employeeId || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">{row.name || "—"}</td>
                          <td className="py-4 px-4">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-medium">
                              {row.payPeriod || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.grossPay)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.deductions)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-semibold">
                              {formatCurrency(row.netPay)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            {formatDate(row.dateProcessed || row.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 text-center" colSpan={7}>
                          <div className="flex flex-col items-center">
                            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xl font-semibold text-gray-500">
                              {isFetching ? "Loading payroll data..." : "No payroll data available"}
                            </p>
                            {!isFetching && (
                              <p className="text-gray-400 mt-2">Payroll records will appear here when available</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
