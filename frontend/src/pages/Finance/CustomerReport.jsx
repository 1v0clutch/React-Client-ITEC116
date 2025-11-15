import React, { useEffect, useMemo, useState } from "react";

export default function CustomerReport() {
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
      const totalValue =
        typeof entry.totalAmount === "number"
          ? entry.totalAmount
          : Number(entry.totalAmount || entry.total || entry.grandTotal) || 0;
      const balanceValue =
        typeof entry.balance === "number"
          ? entry.balance
          : Number(entry.balance || entry.amountDue || entry.remainingBalance) || 0;
      const dateValue =
        entry.date ||
        entry.invoiceDate ||
        entry.issueDate ||
        entry.dueDate ||
        entry.createdAt ||
        entry.updatedAt ||
        null;
      return {
        id: entry._id || entry.id || index,
        customer:
          entry.customerName ||
          entry.customer ||
          entry.clientName ||
          entry.client ||
          entry.customerId?.name ||
          entry.customerId?.fullName ||
          entry.customerId ||
          entry.accountName ||
          "—",
        reference:
          entry.invoiceNumber ||
          entry.invoice ||
          entry.referenceNumber ||
          entry.transactionNumber ||
          entry.documentNumber ||
          entry.orderNumber ||
          "—",
        status: entry.status || entry.state || entry.stage || "—",
        total: totalValue,
        balance: balanceValue,
        date: dateValue,
      };
    };

    const load = async () => {
      try {
        setIsFetching(true);
        const res = await fetch("http://localhost:8000/api/finance/customer-report");
        if (!res.ok) throw new Error("Failed to load customer report");
        const payload = await res.json();
        if (!active) return;
        const list = toArray(payload).map(normalize);
        setData(list);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch customer data");
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
    anchor.download = `customer_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const getStatusTone = (status) => {
    const normalized = (status || "—").toString().toLowerCase();
    if (normalized.includes("paid") || normalized.includes("settled") || normalized.includes("closed")) {
      return "bg-emerald-100 text-emerald-700";
    }
    if (normalized.includes("overdue") || normalized.includes("past due") || normalized.includes("late")) {
      return "bg-rose-100 text-rose-700";
    }
    if (normalized.includes("pending") || normalized.includes("open") || normalized.includes("unpaid")) {
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
    const totalCustomers = sortedData.length;
    const totalInvoiced = sortedData.reduce((sum, entry) => {
      return sum + (Number.isFinite(entry.total) ? entry.total : 0);
    }, 0);
    const totalOutstanding = sortedData.reduce((sum, entry) => {
      return sum + (Number.isFinite(entry.balance) ? entry.balance : 0);
    }, 0);
    const atRisk = sortedData.filter((entry) => {
      const status = (entry.status || "").toLowerCase();
      const hasBalance = Number.isFinite(entry.balance) && entry.balance > 0;
      if (!hasBalance) return false;
      const date = parseDate(entry.date);
      const overdue = date ? date.getTime() < Date.now() : false;
      return overdue || status.includes("overdue") || status.includes("late");
    }).length;
    return [
      { label: "Active Customers", value: totalCustomers.toLocaleString() },
      { label: "Total Invoiced", value: formatCurrency(totalInvoiced) },
      { label: "Outstanding Balance", value: formatCurrency(totalOutstanding) },
      { label: "At-Risk Accounts", value: atRisk.toLocaleString() },
    ];
  }, [sortedData]);

  const exportCsv = () => {
    const headers = ["Customer", "Reference", "Status", "Total", "Balance", "Date"];
    const rows = sortedData.map((entry) => [
      `"${sanitize(entry.customer)}"`,
      `"${sanitize(entry.reference)}"`,
      `"${sanitize(entry.status)}"`,
      formatCurrency(entry.total),
      formatCurrency(entry.balance),
      `"${sanitize(formatDate(entry.date))}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Accounts Receivable (Customer)</h1>
        <p className="text-lg text-slate-600">Manage and track customer accounts and receivables</p>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-blue-600">{metric.label}</p>
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
                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold">Reference</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    <th className="px-4 py-3 text-center font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedData.length ? (
                    sortedData.map((entry) => (
                      <tr key={entry.id} className="transition hover:bg-blue-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{entry.customer}</td>
                        <td className="px-4 py-3">{entry.reference}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                              entry.status
                            )}`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-700">
                          {formatCurrency(entry.total)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                          {formatCurrency(entry.balance)}
                        </td>
                        <td className="px-4 py-3 text-center">{formatDate(entry.date)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                        {isFetching ? "Loading customer data..." : "No customer data available"}
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
