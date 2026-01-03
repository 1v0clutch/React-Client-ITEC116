import React, { useEffect, useMemo, useState } from "react";

export default function FinanceHead() {
  const [entries, setEntries] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  const toCurrency = (value) => {
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) return null;
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    let active = true;

    const toArray = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        for (const key of [
          "data",
          "items",
          "results",
          "records",
          "rows",
          "list",
          "content",
        ]) {
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
          : Number(item.balance || item.amountDue || item.remainingBalance) ||
            0;
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
      const employee =
        item.name ||
        item.employeeName ||
        item.employee ||
        item.employeeId ||
        "—";
      const period = item.payPeriod || item.period || item.cycle || "—";
      const netPay =
        typeof item.netPay === "number"
          ? item.netPay
          : Number(item.netPay || item.totalNetPay || item.amount) || 0;
      const dateValue =
        item.dateProcessed ||
        item.processedAt ||
        item.createdAt ||
        item.updatedAt ||
        null;
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

    // ✅ NEW: Extract project budget data
    const extractProjectBudget = (item, index) => {
      const projectName =
        item.projectName || item.name || item.title || `Project ${index + 1}`;
      const totalActualCost = item.totalActualCost || item.actualCost || 0;
      const status = item.status || "Active";
      const dateValue =
        item.updatedAt || item.createdAt || new Date().toISOString();

      return {
        id: `project-${item._id || item.id || index}`,
        date: dateValue,
        category: "Project Cost",
        primary: projectName,
        secondary: status,
        value: toCurrency(totalActualCost) || "—",
        metricValue: Number.isFinite(totalActualCost) ? totalActualCost : 0,
      };
    };

    // ✅ NEW: Fetch project budgets
    const fetchProjectBudgets = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/projectBudget");
        if (!response.ok) return [];
        const payload = await response.json();
        const list = toArray(payload);
        return list.map(extractProjectBudget);
      } catch (error) {
        console.error("Error fetching project budgets:", error);
        return [];
      }
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

        // Fetch all data sources including project budgets
        const results = await Promise.allSettled([
          // Original loaders
          ...loaders.map(async ({ url, extractor }) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            const payload = await response.json();
            const list = toArray(payload);
            return list.map(extractor);
          }),
          // New project budgets loader
          fetchProjectBudgets(),
        ]);

        if (!active) return;

        // Combine all results
        const combined = results.flatMap((result) =>
          result.status === "fulfilled" ? result.value : []
        );

        setEntries(combined);
        setError(combined.length ? null : "Unable to fetch finance data");
      } catch (err) {
        if (!active) return;
        console.error("Error loading finance data:", err);
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
    anchor.download = `finance_summary_${new Date()
      .toISOString()
      .slice(0, 10)}.${extension}`;
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

  // ✅ UPDATED: Include project costs in metrics
  const metrics = useMemo(() => {
    if (!entries.length) {
      return [
        { label: "Records Synced", value: "0" },
        { label: "Accounts Receivable", value: "₱0.00" },
        { label: "Accounts Payable", value: "₱0.00" },
        { label: "Project Costs", value: "₱0.00" },
        { label: "Payroll", value: "₱0.00" },
        { label: "Inventory Movements", value: "0" },
      ];
    }

    const receivablesTotal = entries
      .filter((entry) => entry.category === "Customer Receivable")
      .reduce(
        (sum, entry) =>
          sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0),
        0
      );

    const payablesTotal = entries
      .filter((entry) => entry.category === "Supplier Purchase")
      .reduce(
        (sum, entry) =>
          sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0),
        0
      );

    const projectCostsTotal = entries
      .filter((entry) => entry.category === "Project Cost")
      .reduce(
        (sum, entry) =>
          sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0),
        0
      );

    const payrollTotal = entries
      .filter((entry) => entry.category === "Payroll")
      .reduce(
        (sum, entry) =>
          sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0),
        0
      );

    const inventoryCount = entries.filter(
      (entry) => entry.category === "Inventory Movement"
    ).length;
    const projectCount = entries.filter(
      (entry) => entry.category === "Project Cost"
    ).length;

    const currencyOrZero = (amount) => toCurrency(amount) || "₱0.00";

    return [
      { label: "Records Synced", value: entries.length.toLocaleString() },
      { label: "Accounts Receivable", value: currencyOrZero(receivablesTotal) },
      { label: "Accounts Payable", value: currencyOrZero(payablesTotal) },
      {
        label: `Project Costs (${projectCount})`,
        value: currencyOrZero(projectCostsTotal),
      },
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
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );
    downloadFile(csv, "text/csv", "csv");
  };

  const getCategoryTone = (category) => {
    const normalized = (category || "—").toLowerCase();
    if (normalized.includes("supplier")) return "bg-amber-100 text-amber-700";
    if (normalized.includes("customer"))
      return "bg-emerald-100 text-emerald-700";
    if (normalized.includes("inventory"))
      return "bg-indigo-100 text-indigo-700";
    if (normalized.includes("payroll")) return "bg-sky-100 text-sky-700";
    if (normalized.includes("project")) return "bg-purple-100 text-purple-700"; // ✅ NEW: Project color
    return "bg-slate-100 text-slate-700";
  };

  const getValueTone = (category) => {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("receivable")) return "text-emerald-700";
    if (normalized.includes("supplier")) return "text-amber-700";
    if (normalized.includes("payroll")) return "text-sky-700";
    if (normalized.includes("inventory")) return "text-indigo-700";
    if (normalized.includes("project")) return "text-purple-700"; // ✅ NEW: Project color
    return "text-slate-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          General Ledger
        </h1>
        <p className="text-lg text-slate-600">
          Overview of financial statements and ledger entries
        </p>
      </div>
      <div className="bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {" "}
            {/* ✅ Changed to 6 columns */}
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-blue-600">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={isFetching || !sortedEntries.length}
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
                    <th className="px-4 py-3 text-center font-semibold">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Primary
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Secondary
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sortedEntries.length ? (
                    sortedEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="transition hover:bg-blue-50/60"
                      >
                        <td className="px-4 py-3 text-center text-slate-500">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${getCategoryTone(
                              entry.category
                            )}`}
                          >
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {entry.primary}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {entry.secondary}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold ${getValueTone(
                            entry.category
                          )}`}
                        >
                          {entry.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-500"
                        colSpan={5}
                      >
                        {isFetching
                          ? "Loading finance data..."
                          : "No finance data available"}
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
