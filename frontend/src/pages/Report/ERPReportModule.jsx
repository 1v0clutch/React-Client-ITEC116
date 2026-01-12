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
    { id: 1, name: "Sales Summary", type: "sales", moduleId: 8, department: "Sales" },
    { id: 2, name: "Inventory Stock", type: "inventory", moduleId: 1, department: "Inventory" },
    { id: 3, name: "Profit & Loss", type: "finance", moduleId: 5, department: "Finance" },
    { id: 4, name: "Transaction Report", type: "transaction", moduleId: 2, department: "Finance" },
    { id: 5, name: "Warehouse Report", type: "warehouse", moduleId: 3, department: "Warehouse" },
    { id: 6, name: "Procurement Report", type: "procurement", moduleId: 4, department: "Procurement" },
    { id: 7, name: "HR Report", type: "hr", moduleId: 10, department: "HR" },
  ]);

  const [filteredReports, setFilteredReports] = useState(reports);

  const [selectedReport, setSelectedReport] = useState(null); 
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isRealTime, setIsRealTime] = useState(false);
  const [log, setLog] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Filter available reports based on selected department
  useEffect(() => {
    if (filters.department === "All") {
      setFilteredReports(reports);
      addLog(`Showing all ${reports.length} reports`);
    } else {
      const filtered = reports.filter(report => 
        report.department === filters.department || report.department === "All"
      );
      setFilteredReports(filtered);
      addLog(`Filtered reports: ${filtered.length} reports for ${filters.department} department`);
    }
  }, [filters.department, reports]);

  // ✅ Client-side data filtering - filters table data without re-fetching from API
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    let filtered = [...data];

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((row) => {
        const dateFields = ['Date', 'Updated', 'Created', 'date', 'updatedAt', 'createdAt'];
        const rowDateField = dateFields.find(field => row[field]);
        
        if (!rowDateField) return true;
        
        const date = new Date(row[rowDateField]);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && date < fromDate) return false;
        if (toDate && date > toDate) return false;
        return true;
      });
    }

    // Filter by department
    if (filters.department !== "All") {
      filtered = filtered.filter((row) => {
        const deptFields = ['Department', 'department', 'Type', 'type'];
        const rowDeptField = deptFields.find(field => row[field]);
        
        if (!rowDeptField) return true;
        
        return row[rowDeptField]?.toString().toLowerCase().includes(filters.department.toLowerCase());
      });
    }

    // Filter by region
    if (filters.region !== "All") {
      filtered = filtered.filter((row) => {
        const regionFields = ['Region', 'region', 'Location', 'location'];
        const rowRegionField = regionFields.find(field => row[field]);
        
        if (!rowRegionField) return true;
        
        return row[rowRegionField]?.toString().toLowerCase().includes(filters.region.toLowerCase());
      });
    }

    setFilteredData(filtered);
    if (data.length > 0) {
      addLog(`Table filtered: ${filtered.length} of ${data.length} records`);
    }
  }, [data, filters]);

  // ✅ Calculate summary statistics from filtered data
  const calculateSummary = () => {
    if (filteredData.length === 0) return null;

    const summary = {
      totalRecords: filteredData.length,
      originalRecords: data.length,
      filterApplied: filteredData.length !== data.length,
    };

    // Calculate numeric summaries
    const numericFields = Object.keys(filteredData[0]).filter(key => {
      const value = filteredData[0][key];
      return typeof value === 'number' || (!isNaN(parseFloat(value)) && key !== 'ID');
    });

    numericFields.forEach(field => {
      const values = filteredData.map(row => parseFloat(row[field]) || 0);
      summary[field] = {
        total: values.reduce((sum, val) => sum + val, 0),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    // Count by categories
    const categoryFields = ['Department', 'Type', 'Status', 'Category', 'Region'];
    categoryFields.forEach(field => {
      if (filteredData[0][field]) {
        const counts = {};
        filteredData.forEach(row => {
          const value = row[field] || 'Unknown';
          counts[value] = (counts[value] || 0) + 1;
        });
        summary[`${field}Breakdown`] = counts;
      }
    });

    return summary;
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
    const dataToExport = filteredData.length > 0 ? filteredData : data;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
    XLSX.writeFile(workbook, `${selectedReport.name}.csv`);
    addLog(`Exported ${dataToExport.length} records to CSV`);
  };

  // ✅ Export as Excel
  const exportExcel = () => {
    if (!selectedReport) return;
    const dataToExport = filteredData.length > 0 ? filteredData : data;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedReport.name);
    XLSX.writeFile(workbook, `${selectedReport.name}.xlsx`);
    addLog(`Exported ${dataToExport.length} records to Excel`);
  };

  // ✅ Fixed Export as PDF
  const exportPDF = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : data;
    
    if (!selectedReport || dataToExport.length === 0) {
      alert("Please generate a report before exporting.");
      return;
    }

    try {
      const doc = new jsPDF("landscape", "pt", "a4");
      const currentDate = new Date().toLocaleString();
      const reportTitle = `${selectedReport.name} Report`;

      // ✅ Header section
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Enterprise Resource Planning Report", 40, 40);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(reportTitle, 40, 65);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, 40, 85);

      // ✅ Filter metadata
      const filterText = [
        `Date Range: ${filters.dateFrom && filters.dateTo ? `${filters.dateFrom} to ${filters.dateTo}` : "N/A"}`,
        `Department: ${filters.department || "All"}`,
        `Region: ${filters.region || "All"}`,
      ];

      filterText.forEach((filter, index) => {
        doc.text(filter, 40, 105 + index * 15);
      });

      // ✅ Prepare table data - dynamically extract headers and rows
      const headers = [Object.keys(data[0])];
      const rows = data.map((row) => Object.values(row));

      // ✅ Create table with autoTable
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 155,
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: { 
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { 
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        theme: "grid",
        margin: { top: 155, left: 40, right: 40 },
        didDrawPage: (data) => {
          // Footer on each page
          doc.setFontSize(8);
          doc.setTextColor(100);
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} | Generated by ERP Reporting Module | ${currentDate}`,
            40,
            pageHeight - 20
          );
        },
      });

      // ✅ Save PDF
      const fileName = `${selectedReport.name.replace(/\s+/g, '_')}_Report_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      addLog(`Exported ${selectedReport.name} to PDF successfully`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(`Failed to export PDF: ${error.message}`);
      addLog(`PDF export failed: ${error.message}`);
    }
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

          const items = Array.isArray(inventoryData) ? inventoryData : [];

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
          const [suppliersRes, requisitionsRes, posRes, invoicesRes] = await Promise.all([
            fetch(`${API_MODULES_BASE}/suppliers`).catch(() => ({ json: () => ({ data: [] }) })),
            fetch(`${API_MODULES_BASE}/requisitions`).catch(() => ({ json: () => ({ data: [] }) })),
            fetch(`${API_MODULES_BASE}/purchase-orders`).catch(() => ({ json: () => ({ data: [] }) })),
            fetch(`${API_MODULES_BASE}/invoices`).catch(() => ({ json: () => ({ data: [] }) })),
          ]);

          const suppliersJson = await suppliersRes.json().catch(() => ({ data: [] }));
          const requisitionsJson = await requisitionsRes.json().catch(() => ({ data: [] }));
          const posJson = await posRes.json().catch(() => ({ data: [] }));
          const invoicesJson = await invoicesRes.json().catch(() => ({ data: [] }));

          const suppliers = suppliersJson.data || suppliersJson || [];
          const requisitions = requisitionsJson.data || requisitionsJson || [];
          const pos = posJson.data || posJson || [];
          const invoices = invoicesJson.data || invoicesJson || [];

          moduleData = [
            ...suppliers.map((s, idx) => ({
              ID: `S${idx + 1}`,
              Type: "Supplier",
              Name: s.name || "N/A",
              Contact: s.contactPerson || "N/A",
              Status: "Active",
            })),

            ...requisitions.map((r, idx) => ({
              ID: `R${idx + 1}`,
              Type: "Requisition",
              Description: r.description || "N/A",
              Quantity: r.quantity || 0,
              Status: r.status || "N/A",
            })),

            ...pos.map((po, idx) => ({
              ID: `PO${idx + 1}`,
              Type: "Purchase Order",
              Description: po.description || "N/A",
              Status: po.status || "N/A",
              Date: po.orderDate ? new Date(po.orderDate).toLocaleDateString() : "N/A",
            })),

            ...invoices.map((inv, idx) => ({
              ID: `INV${idx + 1}`,
              Type: "Invoice",
              Amount: inv.totalAmount || 0,
              Status: inv.status || "N/A",
              Date: inv.dateReceived
                ? new Date(inv.dateReceived).toLocaleDateString()
                : "N/A",
            })),
          ];
          break;


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
            ...leaves.map((l, idx) => ({ ID: `L${idx + 1}`, Type: "Leave", Employee: l.employeeId || "N/A", LeaveType: l.type || "N/A", Status: l.status || "N/A" })),
          ];
          break;

        case "sales":
          try {
            const response = await fetch(`${API_MODULES_BASE}/sales-orders/all`);
            const salesData = await response.json();

            const list = Array.isArray(salesData) ? salesData : [];

            moduleData = list.map((s, idx) => ({
              ID: idx + 1,
              OrderNumber: s.orderNumber || "N/A",
              Product: s.productId?.name || s.productId?._id || "N/A",
              Customer: s.customerName || "N/A",
              Amount: s.totalAmount || 0,
              Status: s.status || "N/A",
              Date: s.createdAt
                ? new Date(s.createdAt).toLocaleDateString()
                : "N/A",
            }));
          } catch (salesError) {
            moduleData = [
              {
                ID: 1,
                Message: "Sales module API not available or returned invalid data.",
              },
            ];
          }
          break;



        case "customer_service":
          try {
            const response = await fetch(`${API_MODULES_BASE}/customer-service/tickets`);

            if (!response.ok) {
              throw new Error(`API returned status ${response.status}`);
            }

            const ticketsData = await response.json();

            moduleData = ticketsData.map((t, idx) => ({
              ID: idx + 1,
              TicketNumber: t.ticketNumber ?? "N/A",
              Customer: t.customerName ?? "N/A",
              Issue: t.issue ?? "N/A",
              Status: t.status ?? "N/A",
              Created: t.createdAt
                ? new Date(t.createdAt).toLocaleDateString()
                : "N/A",
            }));

          } catch (csError) {
            console.error("Customer Service Fetch Error:", csError);
            moduleData = [
              {
                ID: 1,
                Message:
                  "Customer Service module API is not available. Please implement Module 9 or check the backend route.",
              },
            ];
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
              <p className="text-white/80 text-sm mt-1">Module 7 - Advanced Reporting & Analytics</p>
            </div>
          </div>
          <button
            onClick={pullAllModulesData}
            disabled={loading}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Syncing..." : "Sync All Data"}
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl shadow-lg animate-pulse">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <strong className="font-semibold">Error Occurred:</strong>
              <p className="mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 font-bold text-xl transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-semibold">Loading data, please wait...</span>
          </div>
        </div>
      )}

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-xl font-bold">Customize Reports</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date From
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date To
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department
              </label>
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300 cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Inventory">Inventory</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Procurement">Procurement</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Region
              </label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full border-2 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 group-hover:border-pink-300 cursor-pointer"
              >
                <option value="All">All Regions</option>
                <option value="NCR">NCR</option>
                <option value="Region I">Region I – Ilocos</option>
                <option value="Region II">Region II – Cagayan Valley</option>
                <option value="Region III">Region III – Central Luzon</option>
                <option value="Region IV-A">Region IV-A – CALABARZON</option>
                <option value="Region V">Region V – Bicol Region</option>
                <option value="Region VI">Region VI – Western Visayas</option>
                <option value="Region VII">Region VII – Central Visayas</option>
                <option value="Region VIII">Region VIII – Eastern Visayas</option>
                <option value="Region IX">Region IX – Zamboanga Peninsula</option>
                <option value="Region X">Region X – Northern Mindanao</option>
                <option value="Region XI">Region XI – Davao Region</option>
                <option value="Region XII">Region XII – SOCCSKSARGEN</option>
                <option value="CAR">CAR – Cordillera Administrative Region</option>
                <option value="BARMM">BARMM – Bangsamoro</option>
                <option value="Region XIII">Region XIII – Caraga</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Available Reports Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold">Available Reports</h2>
            </div>
            {filters.department !== "All" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {filters.department}
                </span>
                <span className="text-xs text-white/80">
                  {filteredReports.length} of {reports.length} reports
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {filteredReports.length > 0 ? (
            <div className="space-y-3">
              {filteredReports.map((r) => (
              <div 
                key={r.id} 
                className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-md group-hover:shadow-xl transition-shadow">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 text-lg">{r.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full font-medium">
                          {r.department}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateReport(r)}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {loading ? "Loading..." : "Generate"}
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-semibold text-lg">No reports available for {filters.department} department</p>
              <p className="text-sm text-gray-400 mt-2">Try selecting a different department or "All Departments"</p>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY SECTION */}
      {selectedReport && (filteredData.length > 0 || data.length > 0) && (() => {
        const dataForSummary = filteredData.length > 0 ? filteredData : data;
        if (dataForSummary.length === 0) return null;
        
        const summary = calculateSummary();
        return summary ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border border-blue-200">
            <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Report Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{summary.totalRecords}</p>
                {summary.filterApplied && (
                  <p className="text-xs text-gray-500 mt-1">of {summary.originalRecords} total</p>
                )}
              </div>
              
              {Object.keys(summary).filter(key => typeof summary[key] === 'object' && summary[key].total !== undefined).slice(0, 3).map((field, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-medium">{field}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary[field].total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg: {summary[field].average.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Category Breakdowns */}
            {Object.keys(summary).filter(key => key.endsWith('Breakdown')).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(summary).filter(key => key.endsWith('Breakdown')).map((breakdownKey, idx) => {
                  const breakdown = summary[breakdownKey];
                  const label = breakdownKey.replace('Breakdown', '');
                  return (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{label} Distribution</p>
                      <div className="space-y-1">
                        {Object.entries(breakdown).slice(0, 5).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 truncate">{key}</span>
                            <span className="font-semibold text-gray-800 ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null;
      })()}

      {/* TABLE PREVIEW */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg text-gray-800">Report Preview</h2>
          {filteredData.length > 0 && filteredData.length !== data.length && (
            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Showing {filteredData.length} of {data.length} records
            </span>
          )}
        </div>
        {selectedReport ? (
          <>
            <Table reportType={selectedReport.type} data={filteredData.length > 0 ? filteredData : data} />
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
              <button 
                onClick={exportCSV} 
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button 
                onClick={exportExcel} 
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel
              </button>
              <button 
                onClick={exportPDF} 
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
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
          <h2 className="font-semibold text-lg mb-3 text-gray-800">Schedule Recurring Reports</h2>
          
          {schedule && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Active Schedule: <span className="font-bold">{schedule}</span>
                  </p>
                  <p className="text-xs text-green-600">
                    Report "{selectedReport.name}" will be generated {schedule.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => scheduleReport("Daily")}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                schedule === "Daily" 
                  ? "bg-blue-500 text-white border-blue-600 shadow-lg" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">Daily</span>
              <span className="text-xs mt-1 opacity-75">Every day at 9:00 AM</span>
            </button>

            <button
              onClick={() => scheduleReport("Weekly")}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                schedule === "Weekly" 
                  ? "bg-blue-600 text-white border-blue-700 shadow-lg" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold">Weekly</span>
              <span className="text-xs mt-1 opacity-75">Every Monday at 9:00 AM</span>
            </button>

            <button
              onClick={() => scheduleReport("Monthly")}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                schedule === "Monthly" 
                  ? "bg-blue-700 text-white border-blue-800 shadow-lg" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Monthly</span>
              <span className="text-xs mt-1 opacity-75">1st of every month at 9:00 AM</span>
            </button>
          </div>

          {schedule && (
            <button
              onClick={() => {
                setSchedule(null);
                addLog(`Cancelled ${schedule} schedule for ${selectedReport.name}`);
              }}
              className="mt-4 w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-300"
            >
              Cancel Schedule
            </button>
          )}

          <p className="text-xs text-gray-500 mt-3 text-center">
            Note: Scheduled reports will be automatically generated and can be accessed from the Reports section.
          </p>
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
