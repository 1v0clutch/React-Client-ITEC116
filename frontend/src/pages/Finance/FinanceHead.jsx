import React, { useEffect, useMemo, useState } from "react";

export default function FinanceHead() {
  const [entries, setEntries] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const toCurrency = (value) => {
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) return null;
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
      const totalAmount =
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
        value: toCurrency(totalAmount) || "—",
        metricValue: Number.isFinite(totalAmount) ? totalAmount : 0,
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
      const totalAmount =
        typeof item.totalAmount === "number"
          ? item.totalAmount
          : Number(item.totalAmount || item.total || item.grandTotal) || 0;
      const amountValue = balance || totalAmount;
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
        value: toCurrency(amountValue) || "—",
        metricValue: Number.isFinite(amountValue) ? amountValue : 0,
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
        value: Number.isFinite(quantity) ? quantity.toLocaleString() : "—",
        metricValue: Number.isFinite(quantity) ? quantity : 0,
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
        value: toCurrency(netPay) || "—",
        metricValue: Number.isFinite(netPay) ? netPay : 0,
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

  const metrics = useMemo(() => {
    if (!entries.length) {
      return [
        { label: "Records Synced", value: "0" },
        { label: "Accounts Receivable", value: "₱0.00" },
        { label: "Accounts Payable", value: "₱0.00" },
        { label: "Payroll", value: "₱0.00" },
        { label: "Inventory Movements", value: "0" },
      ];
    }
    const receivablesTotal = entries
      .filter((entry) => entry.category === "Customer Receivable")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);
    const payablesTotal = entries
      .filter((entry) => entry.category === "Supplier Purchase")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);
    const payrollTotal = entries
      .filter((entry) => entry.category === "Payroll")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);
    const inventoryCount = entries.filter((entry) => entry.category === "Inventory Movement").length;
    const currencyOrZero = (amount) => toCurrency(amount) || "₱0.00";
    return [
      { label: "Records Synced", value: entries.length.toLocaleString() },
      { label: "Accounts Receivable", value: currencyOrZero(receivablesTotal) },
      { label: "Accounts Payable", value: currencyOrZero(payablesTotal) },
      { label: "Payroll", value: currencyOrZero(payrollTotal) },
      { label: "Inventory Movements", value: inventoryCount.toLocaleString() },
    ];
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

  const getCategoryTone = (category) => {
    const normalized = (category || "—").toLowerCase();
    if (normalized.includes("supplier")) return "bg-amber-100 text-amber-700";
    if (normalized.includes("customer")) return "bg-emerald-100 text-emerald-700";
    if (normalized.includes("inventory")) return "bg-indigo-100 text-indigo-700";
    if (normalized.includes("payroll")) return "bg-sky-100 text-sky-700";
    return "bg-slate-100 text-slate-700";
  };

  const getValueTone = (category) => {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("receivable")) return "text-emerald-700";
    if (normalized.includes("supplier")) return "text-amber-700";
    if (normalized.includes("payroll")) return "text-sky-700";
    if (normalized.includes("inventory")) return "text-indigo-700";
    return "text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">General Ledger</h2>
            <p className="text-white/80 text-sm">Overview of Financial Statements & Ledger Entries</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Financial Metrics</h3>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{metric.label}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-2 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Export Data</h3>
          </div>
          
          <button
            type="button"
            onClick={exportCsv}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isFetching || !sortedEntries.length}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Financial Transactions</h3>
              <p className="text-white/80 text-sm">{sortedEntries.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xl font-semibold text-red-500">Error Loading Data</p>
              <p className="text-red-400 mt-2">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Primary</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Secondary</th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.length ? (
                    sortedEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                        <td className="py-4 px-4 text-center text-gray-600">{formatDate(entry.date)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getCategoryTone(
                              entry.category
                            )}`}
                          >
                            {entry.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-900">{entry.primary}</td>
                        <td className="py-4 px-4 text-gray-600">{entry.secondary}</td>
                        <td className={`py-4 px-4 text-right font-semibold ${getValueTone(entry.category)}`}>
                          {entry.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-12 text-center" colSpan={5}>
                        {isFetching ? (
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <p className="text-lg font-semibold text-blue-500">Loading finance data...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xl font-semibold text-gray-500">No finance data available</p>
                            <p className="text-gray-400 mt-2">Financial transactions will appear here when available</p>
                          </div>
                        )}
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
