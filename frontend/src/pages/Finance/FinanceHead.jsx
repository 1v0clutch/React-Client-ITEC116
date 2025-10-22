import React, { useEffect, useMemo, useState } from "react";
import FinanceLayout from "./FinanceLayout";

export default function FinanceHead() {
  const [entries, setEntries] = useState([]);
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
      if (!Number.isFinite(amount)) return null;
      return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const extractSupplier = (item, index) => {
      const supplier =
        item.supplierName ||
        item.supplier ||
        item.vendorName ||
        item.vendor ||
        item.supplierId?.name ||
        item.supplierId?.fullName ||
        item.supplierId ||
        "—";
      const status = item.status || item.state || item.stage || "—";
      const total =
        typeof item.totalAmount === "number"
          ? item.totalAmount
          : Number(item.totalAmount || item.total) || 0;
      const dateValue =
        item.date ||
        item.createdAt ||
        item.updatedAt ||
        item.postedAt ||
        item.issuedAt ||
        item.issueDate ||
        item.postedDate ||
        null;
      return {
        id: `supplier-${item._id || item.id || index}`,
        date: dateValue,
        category: "Supplier Purchase",
        primary: supplier,
        secondary: status,
        value: formatCurrency(total) || "—",
      };
    };

    const extractCustomer = (item, index) => {
      const customer =
        item.customerName ||
        item.customer ||
        item.clientName ||
        item.client ||
        item.customerId?.name ||
        item.customerId?.fullName ||
        item.customerId ||
        item.accountName ||
        "—";
      const status = item.status || item.state || item.stage || "—";
      const balance =
        typeof item.balance === "number"
          ? item.balance
          : Number(item.balance || item.amountDue || item.remainingBalance) || 0;
      const total =
        typeof item.totalAmount === "number"
          ? item.totalAmount
          : Number(item.totalAmount || item.total || item.grandTotal) || 0;
      const amountValue = balance || total;
      const dateValue =
        item.date ||
        item.invoiceDate ||
        item.issueDate ||
        item.dueDate ||
        item.createdAt ||
        item.updatedAt ||
        null;
      return {
        id: `customer-${item._id || item.id || index}`,
        date: dateValue,
        category: "Customer Receivable",
        primary: customer,
        secondary: status,
        value: formatCurrency(amountValue) || "—",
      };
    };

    const extractInventory = (item, index) => {
      const itemName =
        item.item ||
        item.itemName ||
        item.name ||
        item.itemDetails?.name ||
        item.itemDetails?.itemName ||
        item.itemId?.name ||
        item.itemId?.itemName ||
        item.itemId ||
        item.productName ||
        item.product ||
        "—";
      const type =
        item.type ||
        item.transactionType ||
        item.category ||
        item.movementType ||
        item.eventType ||
        item.operation ||
        "—";
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity || item.qty || item.count) || 0;
      const dateValue =
        item.date ||
        item.transactionDate ||
        item.createdAt ||
        item.updatedAt ||
        item.timestamp ||
        null;
      return {
        id: `inventory-${item._id || item.id || index}`,
        date: dateValue,
        category: "Inventory Movement",
        primary: itemName,
        secondary: type,
        value: quantity ? `${quantity}` : "—",
      };
    };

    const extractPayroll = (item, index) => {
      const employee = item.name || item.employeeName || item.employee || item.employeeId || "—";
      const period = item.payPeriod || item.period || item.cycle || "—";
      const netPay =
        typeof item.netPay === "number"
          ? item.netPay
          : Number(item.netPay || item.totalNetPay || item.amount) || 0;
      const dateValue = item.dateProcessed || item.processedAt || item.createdAt || item.updatedAt || null;
      return {
        id: `payroll-${item._id || item.id || index}`,
        date: dateValue,
        category: "Payroll",
        primary: employee,
        secondary: period,
        value: formatCurrency(netPay) || "—",
      };
    };

    const loaders = [
      {
        url: "http://localhost:8000/api/finance/supplier-report",
        extractor: extractSupplier,
      },
      {
        url: "http://localhost:8000/api/finance/customer-report",
        extractor: extractCustomer,
      },
      {
        url: "http://localhost:8000/api/finance/inventory-transactions",
        extractor: extractInventory,
      },
      {
        url: "http://localhost:8000/api/finance/payroll-report",
        extractor: extractPayroll,
      },
    ];

    const load = async () => {
      try {
        setIsFetching(true);
        const results = await Promise.allSettled(
          loaders.map(async ({ url, extractor }) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            const payload = await response.json();
            const list = toArray(payload);
            return list.map(extractor);
          })
        );
        if (!active) return;
        const fulfilled = results.filter((result) => result.status === "fulfilled");
        const combined = fulfilled.flatMap((result) => result.value);
        setEntries(combined);
        setError(fulfilled.length ? null : "Unable to fetch finance data");
      } catch (err) {
        if (!active) return;
        setEntries([]);
        setError("Unable to fetch finance data");
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
    anchor.download = `finance_summary_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() || 0;
      const dateB = parseDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });
  }, [entries]);

  const exportCsv = () => {
    const headers = ["Date", "Category", "Primary", "Secondary", "Value"];
    const rows = sortedEntries.map((entry) => [
      `"${sanitize(formatDate(entry.date))}"`,
      `"${sanitize(entry.category)}"`,
      `"${sanitize(entry.primary)}"`,
      `"${sanitize(entry.secondary)}"`,
      `"${sanitize(entry.value)}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  const exportExcel = () => {
    const headers = ["Date", "Category", "Primary", "Secondary", "Value"];
    const rows = sortedEntries
      .map((entry) => [
        sanitize(formatDate(entry.date)),
        sanitize(entry.category),
        sanitize(entry.primary),
        sanitize(entry.secondary),
        sanitize(entry.value),
      ])
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");
    const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>`;
    downloadFile(table, "application/vnd.ms-excel", "xls");
  };

  return (
    <FinanceLayout title="General Finance Statements">
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={isFetching || !sortedEntries.length}
        >
          Download CSV
        </button>
        <button
          type="button"
          onClick={exportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={isFetching || !sortedEntries.length}
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
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Primary</th>
              <th className="p-3 text-left">Secondary</th>
              <th className="p-3 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length ? (
              sortedEntries.map((entry) => (
                <tr key={entry.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3 text-center">{formatDate(entry.date)}</td>
                  <td className="p-3">{entry.category}</td>
                  <td className="p-3">{entry.primary}</td>
                  <td className="p-3">{entry.secondary}</td>
                  <td className="p-3 text-right">{entry.value}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={5}>
                  {isFetching ? "Loading finance data..." : "No finance data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </FinanceLayout>
  );
}
