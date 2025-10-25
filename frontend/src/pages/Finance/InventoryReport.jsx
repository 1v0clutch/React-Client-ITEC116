import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

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

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [data]);

  return (
    <FinanceLayout title="Inventory Transactions">
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={isFetching || !sortedData.length}
        >
          Download CSV
        </button>
      </div>

      {error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
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
            {sortedData.length ? (
              sortedData.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{entry.item}</td>
                  <td className="p-3 text-center">{entry.type}</td>
                  <td className="p-3 text-right">{entry.quantity}</td>
                  <td className="p-3">{entry.remarks}</td>
                  <td className="p-3">{entry.purchaseOrderId}</td>
                  <td className="p-3 text-center">{formatDate(entry.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={6}>
                  {isFetching ? "Loading inventory data..." : "No inventory data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </FinanceLayout>
  );
}
