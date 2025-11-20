import React, { useState, useEffect } from "react";
import Table from "../../components/layouts/Table";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ERPReportModule() {

  const API_BASE_URL = "http://localhost:8000/api/bi"; // BI Module API (adjust port if needed)
  const API_MODULES_BASE = "http://localhost:8000/api"; // Direct module APIs (fallback, adjust port if needed)
  
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    department: "All",
    region: "All",
  });
  
  const user = { role: "admin" };  

  // Reports with access roles
  const REPORTS = [
    { id: "sales", name: "Sales Summary", roles: ["admin", "sales", "finance"] },
    { id: "inventory", name: "Inventory Stock", roles: ["admin", "inventory"] },
    { id: "pnl", name: "Profit & Loss", roles: ["admin", "finance"] },
    { id: "warehouse", name: "Warehouse Report", roles: ["admin", "warehouse"] },
    { id: "hr", name: "HR Report", roles: ["admin", "hr"] },
    { id: "audit", name: "Audit Trail", roles: ["admin", "finance", "audit"] },
    { id: "tax", name: "Tax Compliance", roles: ["admin", "finance"] },
  ];
  
  const availableReports = REPORTS.filter(r => r.roles.includes(user.role));

  const [reports] = useState([
    { id: 1, name: "Sales Summary", type: "sales", moduleId: 8 },
    { id: 2, name: "Inventory Stock", type: "inventory", moduleId: 1 },
    { id: 3, name: "Profit & Loss", type: "finance", moduleId: 5 },
    { id: 4, name: "Transaction Report", type: "transaction", moduleId: 2 },
    { id: 5, name: "Warehouse Report", type: "warehouse", moduleId: 3 },
    { id: 6, name: "Procurement Report", type: "procurement", moduleId: 4 },
    { id: 7, name: "HR Report", type: "hr", moduleId: 10 },
    { id: 8, name: "Customer Service Report", type: "customer_service", moduleId: 9 },
    { id: 9, name: "Comprehensive Dashboard", type: "dashboard", moduleId: null },
  ]);

  const [selectedReport, setSelectedReport] = useState(null); 
  const [data, setData] = useState([]);
  const [isRealTime, setIsRealTime] = useState(false);
  const [log, setLog] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async (report) => {
    setSelectedReport(report);
    setLoading(true);
    setError(null);
    addLog(`Generating ${report.name}...`);
    
    try {
      if (report.type === "dashboard") {
        await fetchDashboardData();
      } else {
        await fetchModuleData(report);
      }
      addLog(`Successfully generated ${report.name} (${filters.department}, ${filters.region})`);
    } catch (err) {
      setError(err.message);
      addLog(`Error generating ${report.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export as CSV
  const exportCSV = () => {
    if (!selectedReport) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
    XLSX.writeFile(workbook, `${selectedReport.name}.csv`);
    addLog(`Exported ${selectedReport.name} to CSV`);
  };

  // ✅ Export as Excel
  const exportExcel = () => {
    if (!selectedReport) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
    XLSX.writeFile(workbook, `${selectedReport.name}.xlsx`);
    addLog(`Exported ${selectedReport.name} to Excel`);
  };

  // ✅ Fixed Export as PDF
  const exportPDF = () => {
  if (!selectedReport || data.length === 0) {
    alert("Please generate a report before exporting.");
    return;
  }

  const doc = new jsPDF("landscape", "pt", "A4");
  const currentDate = new Date().toLocaleString();
  const reportTitle = `${selectedReport.name} Report`;

  // ✅ Header section
  doc.setFontSize(18);
  doc.text("Enterprise Resource Planning Report", 40, 40);
  doc.setFontSize(14);
  doc.text(reportTitle, 40, 70);
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 40, 90);

  // ✅ Optional metadata — you can link these from state/filters
  const filterText = [
    `Date Range: ${filters.dateFrom && filters.dateTo ? `${filters.dateFrom} to ${filters.dateTo}` : "N/A"}`,
    `Department: ${filters.department || "All"}`,
    `Region: ${filters.region || "All"}`,
  ];

  filterText.forEach((filter, index) => {
    doc.text(filter, 40, 110 + index * 15);
  });

  // ✅ Prepare table data
  const headers = [Object.keys(data[0])];
  const rows = data.map((row) => Object.values(row));

  // ✅ Create table with styling
  if (doc.autoTable) {
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 160,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 73, 94], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      theme: "striped",
      didDrawPage: (data) => {
        doc.setFontSize(9);
        doc.text(
          `Generated by ERP Reporting Module | ${currentDate}`,
          40,
          doc.internal.pageSize.getHeight() - 20
        );
      },
    });
  } else {
    console.error("jspdf-autotable plugin not loaded.");
    alert("PDF generation failed. Please reinstall jspdf-autotable.");
    return;
  }

  // ✅ Save and log
  doc.save(`${selectedReport.name}_Report.pdf`);
  addLog(`Exported ${selectedReport.name} to PDF`);
};

  // 🔹 Real-time updates
  useEffect(() => {
    if (isRealTime && selectedReport) {
      const interval = setInterval(async () => {
        try {
          if (selectedReport.type === "dashboard") {
            await fetchDashboardData(true);
          } else {
            await fetchModuleData(selectedReport, true);
          }
          addLog(`Pulled live data for ${selectedReport.name}`);
        } catch (err) {
          addLog(`Error pulling live data: ${err.message}`);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isRealTime, selectedReport]);

  // 🔹 Fetch data from BI module or direct module APIs
  const fetchModuleData = async (report, isRefresh = false) => {
    try {
      let response;
      let moduleData = [];

      // Try to fetch from BI module first (summaries/snapshots)
      try {
        // First try summaries (processed data)
        const summariesResponse = await fetch(
          `${API_BASE_URL}/summaries?moduleId=${report.moduleId}${filters.dateFrom ? `&startDate=${filters.dateFrom}` : ''}${filters.dateTo ? `&endDate=${filters.dateTo}` : ''}`
        );
        
        if (summariesResponse.ok) {
          const summaries = await summariesResponse.json();
          if (summaries.length > 0) {
            // Use summary data
            moduleData = transformSummaryToTableData(summaries[0], report.type);
            setData(moduleData);
            if (!isRefresh) addLog(`Loaded summary data for ${report.name}`);
            return;
          }
        }

        // If no summaries, try to get snapshots (raw dummy data)
        const snapshotsResponse = await fetch(
          `${API_BASE_URL}/snapshots?moduleId=${report.moduleId}&snapshotType=dummy_data`
        );
        
        if (snapshotsResponse.ok) {
          const snapshots = await snapshotsResponse.json();
          if (snapshots.length > 0) {
            // Get the latest snapshot
            const latestSnapshot = snapshots[0];
            const snapshotDetailResponse = await fetch(
              `${API_BASE_URL}/snapshots/${latestSnapshot._id || latestSnapshot.id}`
            );
            
            if (snapshotDetailResponse.ok) {
              const snapshotDetail = await snapshotDetailResponse.json();
              const rawData = snapshotDetail.rawData || snapshotDetail.data?.rawData;
              
              if (rawData) {
                // Transform raw dummy data to table format
                moduleData = transformRawDataToTableData(rawData, report.type);
                setData(moduleData);
                if (!isRefresh) addLog(`Loaded dummy data snapshot for ${report.name}`);
                return;
              }
            }
          }
        }
      } catch (biError) {
        console.log("BI data not available, trying direct API...", biError);
      }
      
      // Fallback: Fetch directly from module APIs
      
      switch (report.type) {

        case "inventory":
          response = await fetch(`${API_MODULES_BASE}/inventory/getItems`);
          const inventoryData = await response.json();
          const items = inventoryData.items || [];

          moduleData = items.map((item, idx) => ({
            ID: idx + 1,
            Name: item.name || "N/A",
            SKU: item.sku || "N/A",
            Category: item.category || "N/A",
            Quantity: item.quantity || 0,
            Unit: item.unit || "pcs",
            Updated: item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString()
              : "N/A",
          }));
          break;


        case "transaction":
          response = await fetch(`${API_MODULES_BASE}/transactions`);
          const transactionData = await response.json();

          moduleData = transactionData.map((t, idx) => ({
            ID: idx + 1,
            Type: t.type || "N/A",
            Quantity: t.quantity || 0,
            Item: t.itemId?.name || t.itemId || "N/A",
            Date: t.transactionDate
              ? new Date(t.transactionDate).toLocaleDateString()
              : "N/A",
            Remarks: t.remarks || "N/A",
          }));
          break;


        case "warehouse":
          response = await fetch(`${API_MODULES_BASE}/warehouses/getAllWarehouse`);
          if (!response.ok) throw new Error("Failed to fetch warehouse data");

          const warehouseData = await response.json();

          if (!Array.isArray(warehouseData)) {
            throw new Error("Invalid warehouse response format");
          }

          moduleData = warehouseData.map((w, idx) => ({
            ID: idx + 1,
            Name: w.name ?? "N/A",
            Location: w.location ?? "N/A",
            Capacity: w.capacity ?? 0,
            CurrentStock: w.currentStock ?? 0,
          }));
          break;


        case "procurement":
          // Fetch from multiple procurement endpoints
          const [suppliersRes, requisitionsRes, posRes, invoicesRes] = await Promise.all([
            fetch(`${API_MODULES_BASE}/suppliers`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/requisitions`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/purchase-orders`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/invoices`).catch(() => ({ json: () => [] })),
          ]);
          
          const [suppliers, requisitions, pos, invoices] = await Promise.all([
            suppliersRes.json().catch(() => []),
            requisitionsRes.json().catch(() => []),
            posRes.json().catch(() => []),
            invoicesRes.json().catch(() => []),
          ]);

          moduleData = [
          ...(Array.isArray(suppliers) ? suppliers : []).map((s, idx) => ({
            ID: `S${idx + 1}`,
            Type: "Supplier",
            Name: s.name || "N/A",
            Contact: s.contactPerson || "N/A",
            Status: "Active",
          })),

          ...(Array.isArray(requisitions) ? requisitions : []).map((r, idx) => ({
            ID: `R${idx + 1}`,
            Type: "Requisition",
            Description: r.description || "N/A",
            Quantity: r.quantity || 0,
            Status: r.status || "N/A",
          })),

          ...(Array.isArray(pos) ? pos : []).map((po, idx) => ({
            ID: `PO${idx + 1}`,
            Type: "Purchase Order",
            Description: po.description || "N/A",
            Status: po.status || "N/A",
            Date: po.orderDate
              ? new Date(po.orderDate).toLocaleDateString()
              : "N/A",
          })),

          ...(Array.isArray(invoices) ? invoices : []).map((inv, idx) => ({
            ID: `INV${idx + 1}`,
            Type: "Invoice",
            Amount: inv.totalAmount || 0,
            Status: inv.status || "N/A",
            Date: inv.dateIssued
              ? new Date(inv.dateIssued).toLocaleDateString()
              : "N/A",
          })),
        ];

        case "finance":
          const [financeTransRes, payrollRes] = await Promise.all([
            fetch(`${API_MODULES_BASE}/finance/inventory-transactions`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/finance/payroll-report`).catch(() => ({ json: () => [] })),
          ]);
          
          const [financeTrans, payroll] = await Promise.all([
            financeTransRes.json().catch(() => []),
            payrollRes.json().catch(() => []),
          ]);

          moduleData = [
            ...financeTrans.map((ft, idx) => ({ ID: `FT${idx + 1}`, Type: "Transaction", Amount: ft.amount || 0, Date: ft.date ? new Date(ft.date).toLocaleDateString() : "N/A" })),
            ...payroll.map((p, idx) => ({ ID: `P${idx + 1}`, Type: "Payroll", Employee: p.name || "N/A", NetPay: p.netPay || 0, Period: p.payPeriod || "N/A" })),
          ];
          break;

        case "hr":
          const [payrollHrRes, attendanceRes, leavesRes] = await Promise.all([
            fetch(`${API_MODULES_BASE}/hr/payroll`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/attendance`).catch(() => ({ json: () => [] })),
            fetch(`${API_MODULES_BASE}/leaves`).catch(() => ({ json: () => [] })),
          ]);
          
          const [payrollHr, attendance, leaves] = await Promise.all([
            payrollHrRes.json().catch(() => []),
            attendanceRes.json().catch(() => []),
            leavesRes.json().catch(() => []),
          ]);

          moduleData = [
            ...payrollHr.map((p, idx) => ({ ID: `P${idx + 1}`, Type: "Payroll", Employee: p.name || "N/A", Department: p.department || "N/A", NetPay: p.netPay || 0 })),
            ...attendance.map((a, idx) => ({ ID: `A${idx + 1}`, Type: "Attendance", Employee: a.employeeId || "N/A", Date: a.date ? new Date(a.date).toLocaleDateString() : "N/A", Status: a.status || "N/A" })),
            ...leaves.map((l, idx) => ({ ID: `L${idx + 1}`, Type: "Leave", Employee: l.employeeId || "N/A", Type: l.type || "N/A", Status: l.status || "N/A" })),
          ];
          break;

        case "sales":
          // Sales module may not exist yet, try to fetch or show message
          try {
            response = await fetch(`${API_MODULES_BASE}/sales/orders`);
            const salesData = await response.json();
            moduleData = salesData.map((s, idx) => ({
              ID: idx + 1,
              OrderNumber: s.orderNumber || "N/A",
              Customer: s.customerName || "N/A",
              Amount: s.totalAmount || 0,
              Status: s.status || "N/A",
              Date: s.orderDate ? new Date(s.orderDate).toLocaleDateString() : "N/A",
            }));
          } catch (salesError) {
            moduleData = [{ ID: 1, Message: "Sales module API not available yet. Please implement Module 8." }];
          }
          break;

        case "customer_service":
          try {
            response = await fetch(`${API_MODULES_BASE}/customer-service/tickets`);
            const ticketsData = await response.json();
            moduleData = ticketsData.map((t, idx) => ({
              ID: idx + 1,
              TicketNumber: t.ticketNumber || "N/A",
              Customer: t.customerName || "N/A",
              Issue: t.issue || "N/A",
              Status: t.status || "N/A",
              Created: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A",
            }));
          } catch (csError) {
            moduleData = [{ ID: 1, Message: "Customer Service module API not available yet. Please implement Module 9." }];
          }
          break;

        default:
          moduleData = [];
      }

      setData(moduleData);
      if (!isRefresh) addLog(`Fetched real data for ${report.name} (${moduleData.length} records)`);
    } catch (error) {
      console.error("Error fetching module data:", error);
      setError(`Failed to fetch data: ${error.message}`);
      setData([{ ID: 1, Error: `Failed to load data: ${error.message}` }]);
      throw error;
    }
  };

  // 🔹 Transform raw dummy data to table format
  const transformRawDataToTableData = (rawData, reportType) => {
    const data = [];
    
    if (Array.isArray(rawData)) {
      // Handle array data
      rawData.forEach((item, idx) => {
        const row = { ID: idx + 1 };
        Object.keys(item).forEach(key => {
          const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          if (item[key] instanceof Date) {
            row[displayKey] = new Date(item[key]).toLocaleDateString();
          } else {
            row[displayKey] = item[key];
          }
        });
        data.push(row);
      });
    } else if (typeof rawData === 'object') {
      // Handle nested objects (like procurement, finance)
      Object.keys(rawData).forEach((key, keyIdx) => {
        if (Array.isArray(rawData[key])) {
          rawData[key].forEach((item, idx) => {
            const row = { ID: `${keyIdx + 1}-${idx + 1}`, Type: key };
            Object.keys(item).forEach(itemKey => {
              const displayKey = itemKey.charAt(0).toUpperCase() + itemKey.slice(1).replace(/([A-Z])/g, ' $1');
              if (item[itemKey] instanceof Date) {
                row[displayKey] = new Date(item[itemKey]).toLocaleDateString();
              } else {
                row[displayKey] = item[itemKey];
              }
            });
            data.push(row);
          });
        } else {
          // Single object
          const row = { ID: 1 };
          Object.keys(rawData).forEach(k => {
            row[k] = rawData[k];
          });
          data.push(row);
        }
      });
    }
    
    return data;
  };

  // 🔹 Transform BI summary to table data
  const transformSummaryToTableData = (summary, reportType) => {
    const data = [];
    const metrics = summary.metrics || {};

    switch (reportType) {
      case "inventory":
        if (metrics.inventoryMetrics) {
          data.push({
            ID: 1,
            Metric: "Total Items",
            Value: metrics.inventoryMetrics.totalItems || 0,
          });
          data.push({
            ID: 2,
            Metric: "Total Stock Value",
            Value: metrics.inventoryMetrics.totalStockValue || 0,
          });
          data.push({
            ID: 3,
            Metric: "Low Stock Items",
            Value: metrics.inventoryMetrics.lowStockItems || 0,
          });
          data.push({
            ID: 4,
            Metric: "Out of Stock Items",
            Value: metrics.inventoryMetrics.outOfStockItems || 0,
          });
        }
        break;

      case "finance":
        if (metrics.financeMetrics) {
          data.push({
            ID: 1,
            Category: "Total Revenue",
            Value: metrics.financeMetrics.totalRevenue || 0,
          });
          data.push({
            ID: 2,
            Category: "Total Expenses",
            Value: metrics.financeMetrics.totalExpenses || 0,
          });
          data.push({
            ID: 3,
            Category: "Net Profit",
            Value: metrics.financeMetrics.netProfit || 0,
          });
          data.push({
            ID: 4,
            Category: "Total Invoices",
            Value: metrics.financeMetrics.totalInvoices || 0,
          });
        }
        break;

      default:
        data.push({
          ID: 1,
          Metric: "Total Count",
          Value: metrics.totalCount || 0,
        });
        if (metrics.totalValue) {
          data.push({
            ID: 2,
            Metric: "Total Value",
            Value: metrics.totalValue,
          });
        }
    }

    return data;
  };

  // 🔹 Fetch comprehensive dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      
      const dashboard = await response.json();
      
      // Transform dashboard data to table format
      const tableData = [];
      Object.values(dashboard.modules || {}).forEach((module, idx) => {
        module.summaries?.forEach((summary, sIdx) => {
          tableData.push({
            ID: `${idx + 1}-${sIdx + 1}`,
            Module: module.moduleName,
            SummaryType: summary.summaryType,
            TotalCount: summary.metrics?.totalCount || 0,
            TotalValue: summary.metrics?.totalValue || 0,
            Period: summary.period?.periodType || "N/A",
          });
        });
      });

      setData(tableData.length > 0 ? tableData : [{ ID: 1, Message: "No dashboard data available. Pull data from modules first." }]);
      if (!isRefresh) addLog(`Loaded comprehensive dashboard data`);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError(`Failed to fetch dashboard: ${error.message}`);
      setData([{ ID: 1, Error: `Failed to load dashboard: ${error.message}` }]);
      throw error;
    }
  };

  const addLog = (message) => {
    setLog((prev) => [message, ...prev].slice(0, 15));
  };

  // 🔹 Prevent data silos — auto-sync
  useEffect(() => {
    const autoSync = setInterval(async () => {
      if (selectedReport && !isRealTime) {
        try {
          if (selectedReport.type === "dashboard") {
            await fetchDashboardData(true);
          } else {
            await fetchModuleData(selectedReport, true);
          }
          addLog(`Auto-synced data to prevent outdated reports`);
        } catch (err) {
          addLog(`Auto-sync error: ${err.message}`);
        }
      }
    }, 15000);
    return () => clearInterval(autoSync);
  }, [selectedReport, isRealTime]);

  // 🔹 Pull all modules data on component mount (optional)
  const pullAllModulesData = async () => {
    setLoading(true);
    addLog("Pulling data from all modules...");
    try {
      const response = await fetch(`${API_BASE_URL}/pull-all`);
      const result = await response.json();
      addLog(`Pulled data from ${result.summary.successful} modules successfully`);
      if (result.summary.failed > 0) {
        addLog(`Warning: ${result.summary.failed} modules failed to pull data`);
      }
    } catch (error) {
      addLog(`Error pulling all modules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Schedule recurring reports
  const scheduleReport = async (frequency) => {
  if (!selectedReport) {
    addLog("Please select a report first.");
    return;
  }

  setSchedule(frequency);
  addLog(`Scheduling ${selectedReport.name} to run ${frequency.toLowerCase()}...`);

  try {
    const response = await fetch("http://localhost:8000/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: selectedReport.id,
        reportType: selectedReport.type,
        frequency,
        filters,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      addLog(`Report "${selectedReport.name}" scheduled successfully!`);
    } else {
      addLog(`Failed to schedule report: ${result.message}`);
    }
  } catch (error) {
    addLog(`Error scheduling report: ${error.message}`);
  }
};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ERP Report Module (BI Module 7)</h1>
        <button
          onClick={pullAllModulesData}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Pulling..." : "Pull All Modules Data"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Loading data...
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-medium mb-3">Customize Reports</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          />
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
            <option>All</option>
            <option>Sales</option>
            <option>Finance</option>
            <option>Inventory</option>
          </select>
          <select
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
            className="border p-2 rounded"
          >
             <option>All</option>
              <option>NCR</option>
              <option>Region I – Ilocos</option>
              <option>Region II – Cagayan Valley</option>
              <option>Region III – Central Luzon</option>
              <option>Region IV-A – CALABARZON</option>
              <option>Region V – Bicol Region</option>
              <option>Region VI – Western Visayas</option>
              <option>Region VII – Central Visayas</option>
              <option>Region VIII – Eastern Visayas</option>
              <option>Region IX – Zamboanga Peninsula</option>
              <option>Region X – Northern Mindanao</option>
              <option>Region XI – Davao Region</option>
              <option>Region XII – SOCCSKSARGEN</option>
              <option>CAR – Cordillera Administrative Region</option>
              <option>BARMM – Bangsamoro</option>
              <option>Region XIII – Caraga</option>
          </select>
        </div>
      </div>

      {/* REPORTS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-medium mb-3">Available Reports</h2>
        {reports.map((r) => (
          <div key={r.id} className="flex justify-between items-center border-b py-2">
            <span>{r.name}</span>
            <button
              onClick={() => handleGenerateReport(r)}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Generate"}
            </button>
          </div>
        ))}
      </div>

      {/* TABLE PREVIEW */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-medium mb-3">Report Preview</h2>
        {selectedReport ? (
          <>
            <Table reportType={selectedReport.type} data={data} />
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={exportCSV} className="bg-green-500 text-white px-3 py-1 rounded">
                CSV
              </button>
              <button onClick={exportExcel} className="bg-yellow-500 text-white px-3 py-1 rounded">
                Excel
              </button>
              <button onClick={exportPDF} className="bg-red-500 text-white px-3 py-1 rounded">
                PDF
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-400">Select a report to display data.</p>
        )}
      </div>

      {/* REAL-TIME TOGGLE */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isRealTime}
            onChange={() => setIsRealTime(!isRealTime)}
          />
          <span>Enable Real-Time Data Retrieval</span>
        </label>
      </div>

      {/* SCHEDULING */}
      {selectedReport && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-medium mb-3">Schedule Recurring Reports</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scheduleReport("Daily")}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Daily
            </button>
            <button
              onClick={() => scheduleReport("Weekly")}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Weekly
            </button>
            <button
              onClick={() => scheduleReport("Monthly")}
              className="bg-blue-700 text-white px-3 py-1 rounded"
            >
              Monthly
            </button>
          </div>
        </div>
      )}

      {/* LOGS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-medium mb-3">System Logs</h2>
        <ul className="text-sm h-40 overflow-auto">
          {log.length === 0 ? (
            <li className="text-gray-400">No recent activity</li>
          ) : (
            log.map((l, i) => <li key={i}>• {l}</li>)
          )}
        </ul>
      </div>
    </div>
  );
}
