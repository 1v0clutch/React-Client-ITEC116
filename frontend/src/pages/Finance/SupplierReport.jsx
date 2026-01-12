import { useEffect, useMemo, useState } from "react";

export default function SupplierReport() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        for (const key of ["data", "items", "results", "records", "rows", "list", "content"]) {
          if (Array.isArray(payload[key])) return payload[key];
        }
      }
      return [];
    };

    const normalize = (po, index) => {
      const total = typeof po.totalAmount === "number" ? po.totalAmount : Number(po.totalAmount || po.total) || 0;
      const dateValue =
        po.date ||
        po.createdAt ||
        po.updatedAt ||
        po.postedAt ||
        po.issuedAt ||
        po.issueDate ||
        po.postedDate ||
        null;
      return {
        id: po._id || po.id || index,
        supplier:
          po.supplierName ||
          po.supplier ||
          po.vendorName ||
          po.vendor ||
          po.supplierId?.name ||
          po.supplierId?.fullName ||
          po.supplierId ||
          "—",
        poNumber: po.poNumber || po.purchaseOrderNumber || po.referenceNumber || po.reference || "—",
        status: po.status || po.state || po.stage || "—",
        total,
        date: dateValue,
      };
    };

    const load = async () => {
      try {
        setIsFetching(true);
        setError(null);

        // Fetch from multiple Procurement endpoints for comprehensive supplier data
        const [suppliersRes, purchaseOrdersRes, financeSupplierRes] = await Promise.allSettled([
          fetch("http://localhost:8000/api/suppliers"),
          fetch("http://localhost:8000/api/purchase-orders"),
          fetch("http://localhost:8000/api/finance/supplier-report") // Fallback
        ]);

        if (!active) return;

        let supplierData = [];
        let purchaseOrders = [];

        // Process suppliers data
        if (suppliersRes.status === "fulfilled" && suppliersRes.value.ok) {
          const payload = await suppliersRes.value.json();
          supplierData = toArray(payload);
        }

        // Process purchase orders data
        if (purchaseOrdersRes.status === "fulfilled" && purchaseOrdersRes.value.ok) {
          const payload = await purchaseOrdersRes.value.json();
          purchaseOrders = toArray(payload);
        }

        // If no data from direct endpoints, try fallback
        if (supplierData.length === 0 && purchaseOrders.length === 0) {
          if (financeSupplierRes.status === "fulfilled" && financeSupplierRes.value.ok) {
            const payload = await financeSupplierRes.value.json();
            const fallbackData = toArray(payload).map(normalize);
            setData(fallbackData);
            setError(fallbackData.length === 0 ? "No supplier data available from Procurement or Finance modules" : null);
            return;
          }
        }

        // Combine supplier and purchase order data for comprehensive reporting
        const combinedData = [];

        // Add purchase orders with supplier information
        purchaseOrders.forEach((po, index) => {
          const supplier = supplierData.find(s => 
            s._id === po.supplierId || 
            s.name === po.supplierName || 
            s.supplierName === po.supplierName
          );
          
          combinedData.push({
            ...normalize(po, index),
            supplier: supplier ? (supplier.name || supplier.supplierName || supplier.companyName) : po.supplierName || po.supplier || "—",
            supplierContact: supplier ? supplier.contactInfo : "—",
            supplierEmail: supplier ? supplier.email : "—",
            source: "Procurement Module"
          });
        });

        // Add standalone suppliers without purchase orders
        supplierData.forEach((supplier, index) => {
          const hasOrders = purchaseOrders.some(po => 
            po.supplierId === supplier._id || 
            po.supplierName === supplier.name || 
            po.supplierName === supplier.supplierName
          );
          
          if (!hasOrders) {
            combinedData.push({
              id: supplier._id || supplier.id || `supplier-${index}`,
              supplier: supplier.name || supplier.supplierName || supplier.companyName || "—",
              poNumber: "No Orders",
              status: "Active",
              total: 0,
              date: supplier.createdAt || supplier.updatedAt || null,
              supplierContact: supplier.contactInfo || "—",
              supplierEmail: supplier.email || "—",
              source: "Procurement Module"
            });
          }
        });

        setData(combinedData);
        setError(combinedData.length === 0 ? "No supplier data available from Procurement modules" : null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch supplier data from Procurement modules");
        setData([]);
        console.error("Supplier data loading error:", err);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    load();
    const interval = setInterval(load, 8000); // Real-time updates every 8 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const parseDate = (input) => {
    if (!input) return null;
    const direct = new Date(input);
    if (!Number.isNaN(direct.getTime())) return direct;
    if (typeof input === "string") {
      const parts = input.split(/[/-]/).map((part) => part.trim());
      if (parts.length === 3) {
        const [first, , third] = parts;
        const [a, b, c] = parts.map((part) => Number(part));
        if ([a, b, c].every((num) => Number.isFinite(num))) {
          const isDayFirst = Number(first) > 12;
          const day = isDayFirst ? a : b;
          const month = isDayFirst ? b : a;
          const year = Number(third);
          const rebuilt = new Date(year, month - 1, day);
          if (!Number.isNaN(rebuilt.getTime())) return rebuilt;
        }
      }
    }
    return null;
  };

  const formatCurrency = (value) => {
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) return "—";
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (value) => {
    const date = value instanceof Date ? value : parseDate(value);
    if (!date || Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
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
    anchor.download = `supplier_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const getStatusTone = (status) => {
    const normalized = (status || "—").toString().toLowerCase();
    if (normalized.includes("paid") || normalized.includes("settled") || normalized.includes("completed")) {
      return "bg-emerald-100 text-emerald-700";
    }
    if (normalized.includes("overdue") || normalized.includes("late") || normalized.includes("past due")) {
      return "bg-rose-100 text-rose-700";
    }
    if (normalized.includes("pending") || normalized.includes("processing") || normalized.includes("open")) {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [data]);

  const metrics = useMemo(() => {
    if (!sortedData.length) {
      return [
        { label: "Active Suppliers", value: "0", color: "amber" },
        { label: "Purchase Orders", value: "0", color: "blue" },
        { label: "Total Payables", value: formatCurrency(0), color: "purple" },
        { label: "Overdue Orders", value: "0", color: "red" },
        { label: "Avg Order Value", value: formatCurrency(0), color: "green" },
        { label: "Last Updated", value: "Never", color: "gray" }
      ];
    }
    
    const uniqueSuppliers = new Set(sortedData.map((entry) => entry.supplier || ""));
    const purchaseOrders = sortedData.filter(entry => entry.poNumber !== "No Orders").length;
    const totalPayables = sortedData.reduce((sum, entry) => {
      return sum + (Number.isFinite(entry.total) ? entry.total : 0);
    }, 0);
    const openOrders = sortedData.filter((entry) => {
      const status = (entry.status || "").toLowerCase();
      return status.includes("pending") || status.includes("open") || status.includes("processing");
    }).length;
    const overdueOrders = sortedData.filter((entry) => {
      const status = (entry.status || "").toLowerCase();
      const date = parseDate(entry.date);
      const isPast = date ? date.getTime() < Date.now() : false;
      return status.includes("overdue") || status.includes("late") || (isPast && !status.includes("paid"));
    }).length;
    const avgOrderValue = purchaseOrders > 0 ? totalPayables / purchaseOrders : 0;
    
    return [
      { label: "Active Suppliers", value: uniqueSuppliers.size.toLocaleString(), color: "amber" },
      { label: "Purchase Orders", value: purchaseOrders.toLocaleString(), color: "blue" },
      { label: "Total Payables", value: formatCurrency(totalPayables), color: "purple" },
      { label: "Overdue Orders", value: overdueOrders.toLocaleString(), color: "red" },
      { label: "Avg Order Value", value: formatCurrency(avgOrderValue), color: "green" },
      { label: "Last Updated", value: new Date().toLocaleTimeString(), color: "gray" }
    ];
  }, [sortedData]);

  const exportCsv = () => {
    const headers = ["Supplier", "PO #", "Status", "Total", "Date"];
    const rows = sortedData.map((entry) => [
      `"${sanitize(entry.supplier)}"`,
      `"${sanitize(entry.poNumber)}"`,
      `"${sanitize(entry.status)}"`,
      formatCurrency(entry.total),
      `"${sanitize(formatDate(entry.date))}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Comprehensive Supplier Report</h2>
            <p className="text-white/80 text-sm">Integrated procurement supplier and purchase order analytics</p>
          </div>
          {isFetching && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Supplier Financial Overview</h3>
              <p className="text-white/80 text-sm">Real-time payables and vendor status</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    metric.color === 'amber' ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100' :
                    metric.color === 'blue' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100' :
                    metric.color === 'purple' ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100' :
                    metric.color === 'red' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' :
                    metric.color === 'green' ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' :
                    'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-xl p-2 ${
                      metric.color === 'amber' ? 'bg-amber-500' :
                      metric.color === 'blue' ? 'bg-blue-500' :
                      metric.color === 'purple' ? 'bg-purple-500' :
                      metric.color === 'red' ? 'bg-red-500' :
                      metric.color === 'green' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {index === 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        ) : index === 1 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        ) : index === 4 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        ) : index === 5 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <p className={`text-sm font-semibold uppercase tracking-wide ${
                      metric.color === 'amber' ? 'text-amber-700' :
                      metric.color === 'blue' ? 'text-blue-700' :
                      metric.color === 'purple' ? 'text-purple-700' :
                      metric.color === 'red' ? 'text-red-700' :
                      metric.color === 'green' ? 'text-green-700' :
                      'text-gray-700'
                    }`}>
                      {metric.label}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={exportCsv}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isFetching || !sortedData.length}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>

            {error ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-semibold text-red-500">{error}</p>
                <p className="text-gray-400 mt-2">Please try refreshing the page</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-amber-50 border-b-2 border-amber-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Supplier</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">PO #</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Status</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-700">Total</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length ? (
                      sortedData.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-200">
                          <td className="py-4 px-4 font-semibold text-gray-800">{entry.supplier}</td>
                          <td className="py-4 px-4 text-gray-600">{entry.poNumber}</td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${getStatusTone(
                                entry.status
                              )}`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-blue-700">
                            {formatCurrency(entry.total)}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">{formatDate(entry.date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 text-center text-gray-500" colSpan={5}>
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-500">
                              {isFetching ? "Loading supplier data..." : "No supplier data available"}
                            </p>
                            {!isFetching && <p className="text-gray-400 mt-2">Supplier records will appear here once available</p>}
                          </div>
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
    </div>
  );
}
