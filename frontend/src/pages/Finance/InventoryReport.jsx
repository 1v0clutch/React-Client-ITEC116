import React, { useEffect, useMemo, useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Inventory Report</h1>
        <p className="text-lg text-slate-600">Track inventory movements and transactions</p>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-indigo-600">{metric.label}</p>
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
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 text-center font-semibold">Type</th>
                    <th className="px-4 py-3 text-right font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                    <th className="px-4 py-3 text-left font-semibold">Purchase Order</th>
                    <th className="px-4 py-3 text-center font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedData.length ? (
                    sortedData.map((entry) => (
                      <tr key={entry.id} className="transition hover:bg-blue-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{entry.item}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getTypeTone(
                              entry.type
                            )}`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right text-sm font-semibold ${
                            Number.isFinite(entry.quantity) && entry.quantity < 0
                              ? "text-rose-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {Number.isFinite(entry.quantity) ? entry.quantity.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3">{entry.remarks}</td>
                        <td className="px-4 py-3">{entry.purchaseOrderId}</td>
                        <td className="px-4 py-3 text-center">{formatDate(entry.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                        {isFetching ? "Loading inventory data..." : "No inventory data available"}
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
