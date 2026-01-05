import { useEffect, useMemo, useState } from "react";

export default function InventoryReport() {
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

    const normalize = (entry, index) => {
      const dateValue =
        entry.date ||
        entry.transactionDate ||
        entry.createdAt ||
        entry.updatedAt ||
        entry.timestamp ||
        null;
      const quantityValue =
        typeof entry.quantity === "number"
          ? entry.quantity
          : Number(entry.quantity || entry.qty || entry.count) || 0;
      return {
        id: entry._id || entry.id || index,
        item:
          entry.item ||
          entry.itemName ||
          entry.name ||
          entry.itemDetails?.name ||
          entry.itemDetails?.itemName ||
          entry.itemId?.name ||
          entry.itemId?.itemName ||
          entry.itemId ||
          entry.productName ||
          entry.product ||
          "—",
        type:
          entry.type ||
          entry.transactionType ||
          entry.category ||
          entry.movementType ||
          entry.eventType ||
          entry.operation ||
          "—",
        quantity: quantityValue,
        remarks: entry.remarks || entry.notes || entry.description || entry.details || "—",
        purchaseOrderId:
          entry.purchaseOrderId ||
          entry.purchaseOrder ||
          entry.purchaseOrderNumber ||
          entry.poNumber ||
          entry.reference ||
          entry.referenceNumber ||
          "—",
        date: dateValue,
      };
    };

    const load = async () => {
      try {
        setIsFetching(true);
        const res = await fetch("http://localhost:8000/api/finance/inventory-transactions");
        if (!res.ok) throw new Error("Failed to load inventory transactions");
        const payload = await res.json();
        if (!active) return;
        const list = toArray(payload).map(normalize);
        setData(list);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch inventory data");
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

  const parseDate = (input) => {
    if (!input) return null;
    const direct = new Date(input);
    if (!Number.isNaN(direct.getTime())) return direct;
    if (typeof input === "string") {
      const parts = input.split(/[/-]/).map((part) => part.trim());
      if (parts.length === 3) {
        const [first, second, third] = parts;
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
    anchor.download = `inventory_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const getTypeTone = (type) => {
    const normalized = (type || "—").toString().toLowerCase();
    if (
      normalized.includes("in") ||
      normalized.includes("receive") ||
      normalized.includes("restock") ||
      normalized.includes("purchase") ||
      normalized.includes("add")
    ) {
      return "bg-emerald-100 text-emerald-700";
    }
    if (
      normalized.includes("out") ||
      normalized.includes("issue") ||
      normalized.includes("dispatch") ||
      normalized.includes("consume") ||
      normalized.includes("sale")
    ) {
      return "bg-rose-100 text-rose-700";
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
    const totalMovements = sortedData.length;
    const netQuantity = sortedData.reduce((sum, entry) => {
      return sum + (Number.isFinite(entry.quantity) ? entry.quantity : 0);
    }, 0);
    const inbound = sortedData.filter((entry) => {
      const type = (entry.type || "").toLowerCase();
      return (
        type.includes("in") ||
        type.includes("receive") ||
        type.includes("restock") ||
        type.includes("purchase") ||
        type.includes("add")
      );
    }).length;
    const outbound = sortedData.filter((entry) => {
      const type = (entry.type || "").toLowerCase();
      return (
        type.includes("out") ||
        type.includes("issue") ||
        type.includes("dispatch") ||
        type.includes("consume") ||
        type.includes("sale")
      );
    }).length;
    return [
      { label: "Total Movements", value: totalMovements.toLocaleString() },
      { label: "Net Quantity", value: netQuantity.toLocaleString() },
      { label: "Inbound", value: inbound.toLocaleString() },
      { label: "Outbound", value: outbound.toLocaleString() },
    ];
  }, [sortedData]);

  const exportCsv = () => {
    const headers = ["Item", "Type", "Quantity", "Remarks", "Purchase Order", "Date"];
    const rows = sortedData.map((entry) => [
      `"${sanitize(entry.item)}"`,
      `"${sanitize(entry.type)}"`,
      entry.quantity,
      `"${sanitize(entry.remarks)}"`,
      `"${sanitize(entry.purchaseOrderId)}"`,
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Inventory Report</h2>
            <p className="text-white/80 text-sm">Track inventory movements and transactions</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Inventory Movement Overview</h3>
              <p className="text-white/80 text-sm">Real-time inventory transactions and analytics</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-indigo-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-2 shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">{metric.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
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
                    <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-indigo-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Item</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Type</th>
                      <th className="text-right py-4 px-4 font-bold text-gray-700">Quantity</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Remarks</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Purchase Order</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length ? (
                      sortedData.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                          <td className="py-4 px-4 font-semibold text-gray-800">{entry.item}</td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold shadow-sm ${getTypeTone(
                                entry.type
                              )}`}
                            >
                              {entry.type}
                            </span>
                          </td>
                          <td
                            className={`py-4 px-4 text-right font-bold ${
                              Number.isFinite(entry.quantity) && entry.quantity < 0
                                ? "text-rose-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {Number.isFinite(entry.quantity) ? entry.quantity.toLocaleString() : "—"}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{entry.remarks}</td>
                          <td className="py-4 px-4 text-gray-600">{entry.purchaseOrderId}</td>
                          <td className="py-4 px-4 text-center text-gray-600">{formatDate(entry.date)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 text-center text-gray-500" colSpan={6}>
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-lg font-semibold text-gray-500">
                              {isFetching ? "Loading inventory data..." : "No inventory data available"}
                            </p>
                            {!isFetching && <p className="text-gray-400 mt-2">Inventory transactions will appear here once available</p>}
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