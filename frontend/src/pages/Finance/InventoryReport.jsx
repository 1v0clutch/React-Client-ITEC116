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
        setError(null);

        // Fetch from multiple Inventory endpoints for comprehensive data
        const [inventoryRes, transactionsRes, warehousesRes, financeInventoryRes] = await Promise.allSettled([
          fetch("http://localhost:8000/api/inventory/getItems"),
          fetch("http://localhost:8000/api/transactions"),
          fetch("http://localhost:8000/api/warehouses/getAllWarehouse"),
          fetch("http://localhost:8000/api/finance/inventory-transactions") // Fallback
        ]);

        if (!active) return;

        let inventoryItems = [];
        let transactions = [];
        let warehouses = [];

        // Process inventory items
        if (inventoryRes.status === "fulfilled" && inventoryRes.value.ok) {
          const payload = await inventoryRes.value.json();
          inventoryItems = toArray(payload);
        }

        // Process transactions (primary source for movements)
        if (transactionsRes.status === "fulfilled" && transactionsRes.value.ok) {
          const payload = await transactionsRes.value.json();
          transactions = toArray(payload);
        }

        // Process warehouses
        if (warehousesRes.status === "fulfilled" && warehousesRes.value.ok) {
          const payload = await warehousesRes.value.json();
          warehouses = toArray(payload);
        }

        // If no data from direct endpoints, try fallback
        if (inventoryItems.length === 0 && transactions.length === 0) {
          if (financeInventoryRes.status === "fulfilled" && financeInventoryRes.value.ok) {
            const payload = await financeInventoryRes.value.json();
            const fallbackData = toArray(payload).map(normalize);
            setData(fallbackData);
            setError(fallbackData.length === 0 ? "No inventory data available from Inventory or Finance modules" : null);
            return;
          }
        }

        // Combine transaction data with inventory and warehouse information
        const enhancedTransactions = transactions.map((transaction, index) => {
          // Find related inventory item
          const inventoryItem = inventoryItems.find(item => 
            item._id === transaction.itemId || 
            item.name === transaction.item || 
            item.itemName === transaction.item
          );

          // Find related warehouse
          const warehouse = warehouses.find(wh => 
            wh._id === transaction.warehouseId || 
            wh.name === transaction.warehouse
          );

          return {
            ...normalize(transaction, index),
            item: inventoryItem ? (inventoryItem.name || inventoryItem.itemName) : transaction.item || "—",
            itemCategory: inventoryItem ? inventoryItem.category : "—",
            itemUnit: inventoryItem ? inventoryItem.unit : "—",
            warehouse: warehouse ? warehouse.name : transaction.warehouse || "—",
            warehouseLocation: warehouse ? warehouse.location : "—",
            currentStock: inventoryItem ? inventoryItem.quantity : "—",
            source: "Inventory Module"
          };
        });

        // Add inventory items without recent transactions for completeness
        inventoryItems.forEach((item, index) => {
          const hasRecentTransaction = transactions.some(t => 
            t.itemId === item._id || 
            t.item === item.name || 
            t.item === item.itemName
          );
          
          if (!hasRecentTransaction) {
            enhancedTransactions.push({
              id: item._id || `item-${index}`,
              item: item.name || item.itemName || "—",
              type: "Stock Status",
              quantity: item.quantity || 0,
              remarks: `Current stock: ${item.quantity || 0} ${item.unit || 'units'}`,
              purchaseOrderId: "—",
              date: item.updatedAt || item.createdAt || null,
              itemCategory: item.category || "—",
              itemUnit: item.unit || "—",
              warehouse: "—",
              warehouseLocation: "—",
              currentStock: item.quantity || 0,
              source: "Inventory Module"
            });
          }
        });

        setData(enhancedTransactions);
        setError(enhancedTransactions.length === 0 ? "No inventory data available from Inventory modules" : null);
      } catch (err) {
        if (!active) return;
        setError("Unable to fetch inventory data from Inventory modules");
        setData([]);
        console.error("Inventory data loading error:", err);
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
    if (!sortedData.length) {
      return [
        { label: "Total Items", value: "0", color: "indigo" },
        { label: "Total Movements", value: "0", color: "blue" },
        { label: "Net Quantity", value: "0", color: "purple" },
        { label: "Inbound", value: "0", color: "green" },
        { label: "Outbound", value: "0", color: "red" },
        { label: "Warehouses", value: "0", color: "cyan" },
        { label: "Last Updated", value: "Never", color: "gray" }
      ];
    }
    
    const totalMovements = sortedData.length;
    const uniqueItems = new Set(sortedData.map(entry => entry.item || "")).size;
    const uniqueWarehouses = new Set(sortedData.map(entry => entry.warehouse || "").filter(w => w !== "—")).size;
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
      { label: "Total Items", value: uniqueItems.toLocaleString(), color: "indigo" },
      { label: "Total Movements", value: totalMovements.toLocaleString(), color: "blue" },
      { label: "Net Quantity", value: netQuantity.toLocaleString(), color: "purple" },
      { label: "Inbound", value: inbound.toLocaleString(), color: "green" },
      { label: "Outbound", value: outbound.toLocaleString(), color: "red" },
      { label: "Warehouses", value: uniqueWarehouses.toLocaleString(), color: "cyan" },
      { label: "Last Updated", value: new Date().toLocaleTimeString(), color: "gray" }
    ];
  }, [sortedData]);

  const exportCsv = () => {
    const headers = ["Item", "Category", "Type", "Quantity", "Unit", "Warehouse", "Location", "Remarks", "Date", "Source"];
    const rows = sortedData.map((entry) => [
      `"${sanitize(entry.item)}"`,
      `"${sanitize(entry.itemCategory || "—")}"`,
      `"${sanitize(entry.type)}"`,
      entry.quantity,
      `"${sanitize(entry.itemUnit || "—")}"`,
      `"${sanitize(entry.warehouse)}"`,
      `"${sanitize(entry.warehouseLocation || "—")}"`,
      `"${sanitize(entry.remarks)}"`,
      `"${sanitize(formatDate(entry.date))}"`,
      `"${sanitize(entry.source || "Unknown")}"`
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
            <h2 className="text-3xl font-bold text-white tracking-tight">Comprehensive Inventory Report</h2>
            <p className="text-white/80 text-sm">Integrated inventory, transaction, and warehouse analytics</p>
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    metric.color === 'indigo' ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100' :
                    metric.color === 'blue' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100' :
                    metric.color === 'purple' ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100' :
                    metric.color === 'green' ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' :
                    metric.color === 'red' ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100' :
                    metric.color === 'cyan' ? 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100' :
                    'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-xl p-2 ${
                      metric.color === 'indigo' ? 'bg-indigo-500' :
                      metric.color === 'blue' ? 'bg-blue-500' :
                      metric.color === 'purple' ? 'bg-purple-500' :
                      metric.color === 'green' ? 'bg-green-500' :
                      metric.color === 'red' ? 'bg-red-500' :
                      metric.color === 'cyan' ? 'bg-cyan-500' :
                      'bg-gray-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {index === 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        ) : index === 1 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        ) : index === 3 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        ) : index === 4 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        ) : index === 5 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        ) : index === 6 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <p className={`text-sm font-semibold uppercase tracking-wide ${
                      metric.color === 'indigo' ? 'text-indigo-700' :
                      metric.color === 'blue' ? 'text-blue-700' :
                      metric.color === 'purple' ? 'text-purple-700' :
                      metric.color === 'green' ? 'text-green-700' :
                      metric.color === 'red' ? 'text-red-700' :
                      metric.color === 'cyan' ? 'text-cyan-700' :
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
                    <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b-2 border-indigo-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Item
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Type
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center justify-end gap-2">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Quantity
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Warehouse
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Remarks
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Date
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Source
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length ? (
                      sortedData.map((entry) => (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{entry.item}</span>
                              {entry.itemCategory && entry.itemCategory !== "—" && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mt-1 inline-block w-fit">
                                  {entry.itemCategory}
                                </span>
                              )}
                            </div>
                          </td>
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
                            <div className="flex flex-col items-end">
                              <span>{Number.isFinite(entry.quantity) ? entry.quantity.toLocaleString() : "—"}</span>
                              {entry.itemUnit && entry.itemUnit !== "—" && (
                                <span className="text-xs text-gray-500">{entry.itemUnit}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-gray-800">{entry.warehouse}</span>
                              {entry.warehouseLocation && entry.warehouseLocation !== "—" && (
                                <span className="text-xs text-gray-500">{entry.warehouseLocation}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 max-w-xs truncate" title={entry.remarks}>
                            {entry.remarks}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">{formatDate(entry.date)}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              {entry.source || "Unknown"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-12 text-center text-gray-500" colSpan={7}>
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