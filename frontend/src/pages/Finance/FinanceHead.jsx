import React, { useEffect, useMemo, useState } from "react";

export default function FinanceHead() {
  const [entries, setEntries] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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

    // Enhanced data extractors for each module
    const extractPayroll = (item, index) => {
      const employee = item.name || item.employeeName || item.employee || item.employeeId || "—";
      const netPay = typeof item.netPay === "number" ? item.netPay : Number(item.netPay || item.totalNetPay || item.amount) || 0;
      const grossPay = typeof item.grossPay === "number" ? item.grossPay : Number(item.grossPay || item.totalGrossPay) || 0;
      const dateValue = item.dateProcessed || item.processedAt || item.createdAt || item.updatedAt || null;
      
      return {
        id: `payroll-${item._id || item.id || index}`,
        date: dateValue,
        category: "Payroll Expense",
        primary: employee,
        secondary: item.payPeriod || item.period || "—",
        value: toCurrency(netPay) || "—",
        metricValue: Number.isFinite(netPay) ? netPay : 0,
        grossValue: Number.isFinite(grossPay) ? grossPay : 0,
        source: "HR Module"
      };
    };

    const extractSupplier = (item, index) => {
      const supplier = item.supplierName || item.supplier || item.name || item.vendorName || item.vendor || "—";
      const totalAmount = typeof item.totalAmount === "number" ? item.totalAmount : Number(item.totalAmount || item.total || item.amount) || 0;
      const dateValue = item.date || item.createdAt || item.updatedAt || item.orderDate || null;
      
      return {
        id: `supplier-${item._id || item.id || index}`,
        date: dateValue,
        category: "Accounts Payable",
        primary: supplier,
        secondary: item.status || item.poNumber || item.reference || "—",
        value: toCurrency(totalAmount) || "—",
        metricValue: Number.isFinite(totalAmount) ? totalAmount : 0,
        source: "Procurement Module"
      };
    };

    const extractSalesOrder = (item, index) => {
      const customer = item.customerName || item.customer || item.clientName || "—";
      const totalAmount = typeof item.totalAmount === "number" ? item.totalAmount : Number(item.totalAmount || item.total || item.grandTotal) || 0;
      const dateValue = item.orderDate || item.createdAt || item.updatedAt || null;
      
      return {
        id: `sales-${item._id || item.id || index}`,
        date: dateValue,
        category: "Accounts Receivable",
        primary: customer,
        secondary: item.orderNumber || item.status || "—",
        value: toCurrency(totalAmount) || "—",
        metricValue: Number.isFinite(totalAmount) ? totalAmount : 0,
        source: "Sales Module"
      };
    };

    const extractInventory = (item, index) => {
      const itemName = item.item || item.itemName || item.name || item.product || "—";
      const quantity = typeof item.quantity === "number" ? item.quantity : Number(item.quantity || item.qty) || 0;
      const value = typeof item.value === "number" ? item.value : Number(item.value || item.cost || item.price) || 0;
      const dateValue = item.date || item.transactionDate || item.createdAt || item.updatedAt || null;
      
      return {
        id: `inventory-${item._id || item.id || index}`,
        date: dateValue,
        category: "Inventory Movement",
        primary: itemName,
        secondary: item.type || item.transactionType || "—",
        value: quantity > 0 ? `${quantity} units` : "—",
        metricValue: Number.isFinite(value) ? value : 0,
        source: "Inventory Module"
      };
    };

    const extractTransaction = (item, index) => {
      const itemName = item.item || item.itemName || item.name || "—";
      const quantity = typeof item.quantity === "number" ? item.quantity : Number(item.quantity || item.qty) || 0;
      const type = item.type || item.transactionType || "—";
      const dateValue = item.date || item.transactionDate || item.createdAt || null;
      
      return {
        id: `transaction-${item._id || item.id || index}`,
        date: dateValue,
        category: "Stock Movement",
        primary: itemName,
        secondary: `${type} (${quantity} units)`,
        value: quantity.toLocaleString(),
        metricValue: Math.abs(quantity),
        source: "Transaction Module"
      };
    };

    const extractPurchaseOrder = (item, index) => {
      const supplier = item.supplierName || item.supplier || item.vendorName || "—";
      const totalAmount = typeof item.totalAmount === "number" ? item.totalAmount : Number(item.totalAmount || item.total) || 0;
      const dateValue = item.orderDate || item.createdAt || item.updatedAt || null;
      
      return {
        id: `po-${item._id || item.id || index}`,
        date: dateValue,
        category: "Purchase Order",
        primary: supplier,
        secondary: item.poNumber || item.status || "—",
        value: toCurrency(totalAmount) || "—",
        metricValue: Number.isFinite(totalAmount) ? totalAmount : 0,
        source: "Procurement Module"
      };
    };

    // Enhanced data loaders with multiple endpoints per module
    const loaders = [
      // HR Module - Multiple endpoints
      {
        url: "http://localhost:8000/api/hr/payroll",
        extractor: extractPayroll,
        fallback: "http://localhost:8000/api/payroll"
      },
      {
        url: "http://localhost:8000/api/attendance",
        extractor: (item, index) => ({
          id: `attendance-${item._id || index}`,
          date: item.date || item.createdAt,
          category: "Attendance",
          primary: item.employeeName || item.employee || "—",
          secondary: item.status || "—",
          value: item.hoursWorked ? `${item.hoursWorked}h` : "—",
          metricValue: Number(item.hoursWorked) || 0,
          source: "HR Module"
        })
      },
      {
        url: "http://localhost:8000/api/leaves",
        extractor: (item, index) => ({
          id: `leave-${item._id || index}`,
          date: item.startDate || item.createdAt,
          category: "Leave Request",
          primary: item.employeeName || item.employee || "—",
          secondary: `${item.leaveType || "Leave"} (${item.status || "Pending"})`,
          value: item.days ? `${item.days} days` : "—",
          metricValue: Number(item.days) || 0,
          source: "HR Module"
        })
      },
      // Procurement Module
      {
        url: "http://localhost:8000/api/suppliers",
        extractor: extractSupplier
      },
      {
        url: "http://localhost:8000/api/purchase-orders",
        extractor: extractPurchaseOrder
      },
      // Sales Module
      {
        url: "http://localhost:8000/api/sales-orders/all",
        extractor: extractSalesOrder
      },
      // Inventory Module
      {
        url: "http://localhost:8000/api/inventory/getItems",
        extractor: extractInventory
      },
      {
        url: "http://localhost:8000/api/transactions",
        extractor: extractTransaction,
        fallback: "http://localhost:8000/api/transactions/getTransactionRecords"
      },
      // Finance Module (existing endpoints as fallback)
      {
        url: "http://localhost:8000/api/finance/supplier-report",
        extractor: extractSupplier
      },
      {
        url: "http://localhost:8000/api/finance/customer-report",
        extractor: extractSalesOrder
      },
      {
        url: "http://localhost:8000/api/finance/inventory-transactions",
        extractor: extractInventory
      },
      {
        url: "http://localhost:8000/api/finance/payroll-report",
        extractor: extractPayroll
      }
    ];

    const load = async () => {
      try {
        setIsFetching(true);
        setError(null);
        
        const results = await Promise.allSettled(
          loaders.map(async ({ url, extractor, fallback }) => {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                if (fallback) {
                  const fallbackResponse = await fetch(fallback);
                  if (!fallbackResponse.ok) throw new Error(`Failed to load ${url} and ${fallback}`);
                  const payload = await fallbackResponse.json();
                  const list = toArray(payload);
                  return list.map(extractor);
                }
                throw new Error(`Failed to load ${url}`);
              }
              const payload = await response.json();
              const list = toArray(payload);
              return list.map(extractor);
            } catch (error) {
              console.warn(`Failed to load from ${url}:`, error.message);
              return [];
            }
          })
        );
        
        if (!active) return;
        
        const fulfilled = results.filter((result) => result.status === "fulfilled");
        const combined = fulfilled.flatMap((result) => result.value);
        
        // Remove duplicates based on ID
        const uniqueEntries = combined.filter((entry, index, self) => 
          index === self.findIndex(e => e.id === entry.id)
        );
        
        setEntries(uniqueEntries);
        setLastUpdated(new Date());
        setError(uniqueEntries.length === 0 ? "No financial data available from any module" : null);
      } catch (err) {
        if (!active) return;
        setEntries([]);
        setError("Unable to fetch financial data from modules");
        console.error("Finance data loading error:", err);
      } finally {
        if (active) setIsFetching(false);
      }
    };

    load();
    const interval = setInterval(load, 10000); // Increased to 10 seconds for better performance
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
    anchor.download = `comprehensive_finance_report_${new Date().toISOString().slice(0, 10)}.${extension}`;
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
        { label: "Total Records", value: "0", color: "blue" },
        { label: "Accounts Receivable", value: "₱0.00", color: "green" },
        { label: "Accounts Payable", value: "₱0.00", color: "orange" },
        { label: "Payroll Expenses", value: "₱0.00", color: "purple" },
        { label: "Active Modules", value: "0", color: "indigo" },
        { label: "Last Updated", value: "Never", color: "gray" }
      ];
    }

    const receivablesTotal = entries
      .filter((entry) => entry.category === "Accounts Receivable")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);
    
    const payablesTotal = entries
      .filter((entry) => entry.category === "Accounts Payable" || entry.category === "Purchase Order")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);
    
    const payrollTotal = entries
      .filter((entry) => entry.category === "Payroll Expense")
      .reduce((sum, entry) => sum + (Number.isFinite(entry.metricValue) ? entry.metricValue : 0), 0);

    const activeModules = new Set(entries.map(entry => entry.source)).size;
    
    const currencyOrZero = (amount) => toCurrency(amount) || "₱0.00";
    
    return [
      { label: "Total Records", value: entries.length.toLocaleString(), color: "blue" },
      { label: "Accounts Receivable", value: currencyOrZero(receivablesTotal), color: "green" },
      { label: "Accounts Payable", value: currencyOrZero(payablesTotal), color: "orange" },
      { label: "Payroll Expenses", value: currencyOrZero(payrollTotal), color: "purple" },
      { label: "Active Modules", value: activeModules.toString(), color: "indigo" },
      { label: "Last Updated", value: lastUpdated ? lastUpdated.toLocaleTimeString() : "Never", color: "gray" }
    ];
  }, [entries, lastUpdated]);

  const exportCsv = () => {
    const headers = ["Date", "Category", "Primary", "Secondary", "Value", "Source"];
    const rows = sortedEntries.map((entry) => [
      `"${sanitize(formatDate(entry.date))}"`,
      `"${sanitize(entry.category)}"`,
      `"${sanitize(entry.primary)}"`,
      `"${sanitize(entry.secondary)}"`,
      `"${sanitize(entry.value)}"`,
      `"${sanitize(entry.source)}"`
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "text/csv", "csv");
  };

  const getCategoryTone = (category) => {
    const normalized = (category || "—").toLowerCase();
    if (normalized.includes("receivable")) return "bg-emerald-100 text-emerald-700";
    if (normalized.includes("payable") || normalized.includes("purchase")) return "bg-amber-100 text-amber-700";
    if (normalized.includes("payroll")) return "bg-purple-100 text-purple-700";
    if (normalized.includes("inventory") || normalized.includes("stock")) return "bg-indigo-100 text-indigo-700";
    if (normalized.includes("attendance")) return "bg-cyan-100 text-cyan-700";
    if (normalized.includes("leave")) return "bg-pink-100 text-pink-700";
    return "bg-slate-100 text-slate-700";
  };

  const getValueTone = (category) => {
    const normalized = (category || "").toLowerCase();
    if (normalized.includes("receivable")) return "text-emerald-700";
    if (normalized.includes("payable") || normalized.includes("purchase")) return "text-amber-700";
    if (normalized.includes("payroll")) return "text-purple-700";
    if (normalized.includes("inventory") || normalized.includes("stock")) return "text-indigo-700";
    return "text-slate-700";
  };

  const getMetricColor = (color) => {
    const colors = {
      blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
      green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
      orange: "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100",
      purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
      indigo: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100",
      gray: "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
    };
    return colors[color] || colors.gray;
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
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">Comprehensive Financial Dashboard</h2>
            <p className="text-white/80 text-sm">Real-time integration across all ERP modules</p>
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

      {/* Enhanced Metrics Cards */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Multi-Module Financial Metrics</h3>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-xl border-2 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${getMetricColor(metric.color)}`}
            >
              <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{color: `var(--${metric.color}-600)`}}>{metric.label}</p>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
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
              <h3 className="text-xl font-bold text-white">Cross-Module Financial Transactions</h3>
              <p className="text-white/80 text-sm">{sortedEntries.length} transactions from {new Set(sortedEntries.map(e => e.source)).size} modules</p>
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
                    <th className="text-center py-4 px-4 font-semibold text-gray-700">Source</th>
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
                        <td className="py-4 px-4 text-center">
                          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            {entry.source}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-12 text-center" colSpan={6}>
                        {isFetching ? (
                          <div className="flex flex-col items-center">
                            <svg className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <p className="text-lg font-semibold text-blue-500">Loading cross-module financial data...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xl font-semibold text-gray-500">No financial data available</p>
                            <p className="text-gray-400 mt-2">Financial transactions will appear here when modules are active</p>
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
