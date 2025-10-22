import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

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
        const res = await fetch("http://localhost:8000/api/finance/supplier-report");
        if (!res.ok) throw new Error("Failed to load supplier report");
        const payload = await res.json();
        if (!active) return;
        const list = toArray(payload).map(normalize);
        setData(list);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch supplier data");
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

  const exportExcel = () => {
    const headers = ["Supplier", "PO #", "Status", "Total", "Date"];
    const rows = sortedData
      .map((entry) => [
        sanitize(entry.supplier),
        sanitize(entry.poNumber),
        sanitize(entry.status),
        formatCurrency(entry.total),
        sanitize(formatDate(entry.date)),
      ])
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");
    const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    downloadFile(table, "application/vnd.ms-excel", "xls");
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [data]);

  return (
    <FinanceLayout title="Supplier Report">
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
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">PO #</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length ? (
              sortedData.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{entry.supplier}</td>
                  <td className="p-3">{entry.poNumber}</td>
                  <td className="p-3 text-center">{entry.status}</td>
                  <td className="p-3 text-right">{formatCurrency(entry.total)}</td>
                  <td className="p-3 text-center">{formatDate(entry.date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={5}>
                  {isFetching ? "Loading supplier data..." : "No supplier data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </FinanceLayout>
  );
}
