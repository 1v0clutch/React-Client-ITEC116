const axios = require("axios");
const BIReport = require("../models/BIReport");
const BISummary = require("../models/BISummary");
const BIDataSnapshot = require("../models/BIDataSnapshot");

// Base URL for API calls (adjust based on your server configuration)
const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

// Module configuration mapping
const MODULE_CONFIG = {
  1: { name: "Inventory", basePath: "/api/inventory" },
  2: { name: "Transaction", basePath: "/api/transactions" },
  3: { name: "Warehouse", basePath: "/api/warehouses" },
  4: { name: "Procurement", basePath: "/api" }, // Multiple sub-paths
  5: { name: "Finance", basePath: "/api/finance" },
  8: { name: "Sales", basePath: "/api/sales" }, // May need to be created
  9: { name: "Customer Service", basePath: "/api/customer-service" }, // May need to be created
  10: { name: "HR", basePath: "/api/hr" }
};

// Detailed endpoint mapping for each module
const MODULE_ENDPOINTS = {
  1: ["/api/inventory/getItems"], // Inventory
  2: ["/api/transactions"], // Transactions
  3: ["/api/warehouses/getAllWarehouse"], // Warehouse
  4: [
    "/api/suppliers",
    "/api/requisitions",
    "/api/purchase-orders",
    "/api/invoices"
  ], // Procurement (multiple endpoints)
  5: [
    "/api/finance/inventory-transactions",
    "/api/finance/payroll-report"
  ], // Finance
  8: ["/api/sales/orders"], // Sales (may need to be created)
  9: ["/api/customer-service/tickets"], // Customer Service (may need to be created)
  10: [
    "/api/hr/payroll",
    "/api/attendance",
    "/api/leaves"
  ] // HR
};

/**
 * Pull data from a specific module
 */
const pullModuleData = async (moduleId, endpoint = null) => {
  try {
    const module = MODULE_CONFIG[moduleId];
    if (!module) {
      throw new Error(`Module ${moduleId} not found in configuration`);
    }

    let url;
    if (endpoint) {
      url = `${BASE_URL}${endpoint}`;
    } else {
      // Use first endpoint from MODULE_ENDPOINTS as default
      const endpoints = MODULE_ENDPOINTS[moduleId] || [];
      if (endpoints.length > 0) {
        url = `${BASE_URL}${endpoints[0]}`;
      } else {
        url = `${BASE_URL}${module.basePath}`;
      }
    }

    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept 404, 400, etc.
    });

    return {
      success: true,
      moduleId,
      moduleName: module.name,
      endpoint: endpoint || 'default',
      data: response.data,
      recordCount: Array.isArray(response.data) ? response.data.length : 1,
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`Error pulling data from Module ${moduleId}:`, error.message);
    return {
      success: false,
      moduleId,
      moduleName: MODULE_CONFIG[moduleId]?.name || "Unknown",
      error: error.message,
      data: null,
      timestamp: new Date()
    };
  }
};

/**
 * Pull data from all modules (Mass Read)
 * This function pulls data from all endpoints for each module
 */
exports.pullAllModulesData = async (req, res) => {
  try {
    const moduleIds = [1, 2, 3, 4, 5, 8, 9, 10];
    const results = [];
    const allSnapshots = [];

    // Pull data from all modules and their endpoints
    for (const moduleId of moduleIds) {
      const endpoints = MODULE_ENDPOINTS[moduleId] || [];
      const moduleResults = [];

      // If no endpoints defined, try default pull
      if (endpoints.length === 0) {
        const response = await pullModuleData(moduleId);
        moduleResults.push(response);
      } else {
        // Pull from all endpoints for this module
        const promises = endpoints.map(endpoint => pullModuleData(moduleId, endpoint));
        const responses = await Promise.all(promises);
        moduleResults.push(...responses);
      }

      // Process each response and save snapshots
      for (const response of moduleResults) {
        if (response.success && response.data) {
          // Save snapshot
          const snapshot = new BIDataSnapshot({
            snapshotName: `Module_${response.moduleId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            moduleId: response.moduleId,
            moduleName: response.moduleName,
            snapshotType: 'full_pull',
            rawData: response.data,
            metadata: {
              recordCount: response.recordCount,
              dataFields: response.data.length > 0 && typeof response.data[0] === 'object' 
                ? Object.keys(response.data[0]) 
                : [],
              sourceEndpoint: response.endpoint || MODULE_CONFIG[response.moduleId].basePath,
              pullTimestamp: response.timestamp,
              dataVersion: '1.0'
            },
            status: 'completed'
          });
          await snapshot.save();
          allSnapshots.push(snapshot._id);
        }

        results.push({
          moduleId: response.moduleId,
          moduleName: response.moduleName,
          endpoint: response.endpoint || 'default',
          success: response.success,
          recordCount: response.recordCount || 0,
          error: response.error || null,
          timestamp: response.timestamp
        });
      }
    }

    res.json({
      message: "Data pull completed for all modules",
      results,
      summary: {
        totalModules: moduleIds.length,
        totalEndpoints: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        snapshotsCreated: allSnapshots.length
      },
      snapshotIds: allSnapshots
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Pull data from a specific module
 */
exports.pullModuleData = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { endpoint } = req.query;

    const result = await pullModuleData(parseInt(moduleId), endpoint);

    if (result.success && result.data) {
      // Save snapshot
      const snapshot = new BIDataSnapshot({
        snapshotName: `Module_${moduleId}_${Date.now()}`,
        moduleId: parseInt(moduleId),
        moduleName: result.moduleName,
        snapshotType: 'full_pull',
        rawData: result.data,
        metadata: {
          recordCount: result.recordCount,
          dataFields: result.data.length > 0 && typeof result.data[0] === 'object' 
            ? Object.keys(result.data[0]) 
            : [],
          sourceEndpoint: endpoint || MODULE_CONFIG[moduleId].basePath,
          pullTimestamp: result.timestamp,
          dataVersion: '1.0'
        },
        status: 'completed'
      });
      await snapshot.save();

      res.json({
        message: `Data pulled successfully from Module ${moduleId}`,
        ...result,
        snapshotId: snapshot._id
      });
    } else {
      res.status(404).json({
        message: `Failed to pull data from Module ${moduleId}`,
        ...result
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate dummy/mock data for all modules
 * Creates multiple records per module to simulate realistic data
 */
exports.generateDummyData = async (req, res) => {
  try {
    const generateInventoryData = () => {
      const categories = ["Electronics", "Office Supplies", "Furniture", "Tools", "Materials"];
      return Array.from({ length: 10 }, (_, i) => ({
        name: `Sample Item ${i + 1}`,
        sku: `SKU-${String(i + 1).padStart(3, '0')}`,
        description: `Sample inventory item ${i + 1}`,
        category: categories[i % categories.length],
        quantity: Math.floor(Math.random() * 500) + 10,
        unit: "pcs",
        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
    };

    const generateTransactionData = () => {
      const types = ["stock-in", "stock-out"];
      return Array.from({ length: 15 }, (_, i) => ({
        itemId: `item_${i + 1}`,
        type: types[i % 2],
        quantity: Math.floor(Math.random() * 100) + 1,
        remarks: `Dummy transaction ${i + 1}`,
        transactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        purchaseOrderId: i % 3 === 0 ? `PO-${i + 1}` : null
      }));
    };

    const generateWarehouseData = () => {
      return Array.from({ length: 5 }, (_, i) => ({
        name: `Warehouse ${i + 1}`,
        location: `Building ${String.fromCharCode(65 + i)}`,
        capacity: (i + 1) * 10000,
        currentStock: Math.floor((i + 1) * 5000 * Math.random())
      }));
    };

    const generateProcurementData = () => {
      const suppliers = Array.from({ length: 8 }, (_, i) => ({
        name: `Supplier Company ${i + 1}`,
        contactPerson: `Contact Person ${i + 1}`,
        email: `supplier${i + 1}@example.com`,
        phone: `555-${String(i + 1).padStart(4, '0')}`,
        address: `${i + 1}${i % 2 === 0 ? ' Main St' : ' Commerce Ave'}`
      }));

      const requisitions = Array.from({ length: 12 }, (_, i) => ({
        description: `Requisition Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 50) + 1,
        unitPrice: (Math.random() * 1000 + 10).toFixed(2),
        status: ["pending", "approved", "rejected"][i % 3],
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      }));

      const purchaseOrders = Array.from({ length: 10 }, (_, i) => ({
        orderNumber: `PO-${String(i + 1).padStart(4, '0')}`,
        description: `Purchase Order ${i + 1}`,
        status: ["pending", "approved", "delivered"][i % 3],
        orderDate: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
        totalAmount: (Math.random() * 10000 + 100).toFixed(2)
      }));

      const invoices = Array.from({ length: 8 }, (_, i) => ({
        invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
        totalAmount: (Math.random() * 5000 + 100).toFixed(2),
        dateIssued: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ["paid", "pending", "overdue"][i % 3]
      }));

      return { suppliers, requisitions, purchaseOrders, invoices };
    };

    const generateFinanceData = () => {
      const transactions = Array.from({ length: 20 }, (_, i) => ({
        transactionId: `FT-${String(i + 1).padStart(4, '0')}`,
        amount: (Math.random() * 5000 + 100).toFixed(2),
        type: ["revenue", "expense"][i % 2],
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        description: `Finance transaction ${i + 1}`
      }));

      const invoices = Array.from({ length: 15 }, (_, i) => ({
        invoiceNumber: `INV-${String(i + 1).padStart(4, '0')}`,
        totalAmount: (Math.random() * 10000 + 500).toFixed(2),
        dateIssued: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ["paid", "pending"][i % 2]
      }));

      return { transactions, invoices };
    };

    const generateSalesData = () => {
      const customers = ["ABC Corp", "XYZ Ltd", "Tech Solutions", "Global Inc", "Local Business"];
      return Array.from({ length: 15 }, (_, i) => ({
        orderNumber: `SO-${String(i + 1).padStart(4, '0')}`,
        customerName: customers[i % customers.length],
        totalAmount: (Math.random() * 5000 + 200).toFixed(2),
        orderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ["completed", "pending", "cancelled"][i % 3]
      }));
    };

    const generateCustomerServiceData = () => {
      const issues = ["Technical Support", "Billing Inquiry", "Product Question", "Complaint", "Feature Request"];
      return Array.from({ length: 12 }, (_, i) => ({
        ticketNumber: `TKT-${String(i + 1).padStart(4, '0')}`,
        customerName: `Customer ${i + 1}`,
        issue: issues[i % issues.length],
        status: ["open", "in-progress", "resolved", "closed"][i % 4],
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
        priority: ["low", "medium", "high"][i % 3]
      }));
    };

    const generateHRData = () => {
      const departments = ["IT", "HR", "Finance", "Sales", "Operations"];
      return Array.from({ length: 20 }, (_, i) => ({
        employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
        name: `Employee ${i + 1}`,
        department: departments[i % departments.length],
        payPeriod: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
        grossPay: (Math.random() * 5000 + 2000).toFixed(2),
        deductions: (Math.random() * 1000 + 200).toFixed(2),
        netPay: (Math.random() * 4000 + 1500).toFixed(2),
        dateProcessed: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      }));
    };

    // Generate dummy data arrays for each module
    const dummyData = {
      1: generateInventoryData(), // Inventory - array of 10 items
      2: generateTransactionData(), // Transaction - array of 15 transactions
      3: generateWarehouseData(), // Warehouse - array of 5 warehouses
      4: generateProcurementData(), // Procurement - object with suppliers, requisitions, POs, invoices
      5: generateFinanceData(), // Finance - object with transactions and invoices
      8: generateSalesData(), // Sales - array of 15 orders
      9: generateCustomerServiceData(), // Customer Service - array of 12 tickets
      10: generateHRData() // HR - array of 20 payroll records
    };

    // Save dummy data snapshots
    const snapshots = [];
    for (const [moduleId, data] of Object.entries(dummyData)) {
      const isArray = Array.isArray(data);
      const recordCount = isArray ? data.length : (typeof data === 'object' ? Object.keys(data).reduce((sum, key) => sum + (Array.isArray(data[key]) ? data[key].length : 1), 0) : 1);
      
      const snapshot = new BIDataSnapshot({
        snapshotName: `Dummy_Module_${moduleId}_${Date.now()}`,
        moduleId: parseInt(moduleId),
        moduleName: MODULE_CONFIG[moduleId]?.name || "Unknown",
        snapshotType: 'dummy_data',
        rawData: data,
        metadata: {
          recordCount: recordCount,
          dataFields: isArray && data.length > 0 ? Object.keys(data[0]) : 
                     (typeof data === 'object' ? Object.keys(data) : []),
          sourceEndpoint: "dummy",
          pullTimestamp: new Date(),
          dataVersion: '1.0'
        },
        status: 'completed'
      });
      await snapshot.save();
      snapshots.push(snapshot);
    }

    // Automatically process the dummy data into summaries
    const summaries = [];
    for (const snapshot of snapshots) {
      const summary = await processSnapshotToSummary(snapshot);
      if (summary) {
        summaries.push(summary);
      }
    }

    res.json({
      message: "Dummy data generated, saved, and processed for all modules",
      summary: {
        totalModules: Object.keys(dummyData).length,
        snapshotsCreated: snapshots.length,
        summariesCreated: summaries.length
      },
      modules: Object.keys(dummyData).map(id => {
        const data = dummyData[id];
        const isArray = Array.isArray(data);
        const recordCount = isArray ? data.length : 
          (typeof data === 'object' ? Object.keys(data).reduce((sum, key) => 
            sum + (Array.isArray(data[key]) ? data[key].length : 1), 0) : 1);
        
        return {
          moduleId: parseInt(id),
          moduleName: MODULE_CONFIG[id]?.name,
          recordCount: recordCount,
          snapshotId: snapshots.find(s => s.moduleId === parseInt(id))?._id,
          summaryId: summaries.find(s => s.moduleId === parseInt(id))?._id
        };
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process and summarize data from snapshots
 */
exports.processAndSummarize = async (req, res) => {
  try {
    const { moduleId, startDate, endDate } = req.query;
    
    // Get snapshots for the module(s)
    const query = {};
    if (moduleId) {
      query.moduleId = parseInt(moduleId);
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const snapshots = await BIDataSnapshot.find(query).sort({ createdAt: -1 });

    if (snapshots.length === 0) {
      return res.json({ message: "No snapshots found", summaries: [] });
    }

    // Process each snapshot and create summaries
    const summaries = [];
    for (const snapshot of snapshots) {
      const summary = await processSnapshotToSummary(snapshot);
      if (summary) {
        summaries.push(summary);
      }
    }

    res.json({
      message: "Data processed and summarized",
      summaries,
      totalSnapshots: snapshots.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper function to process a snapshot into a summary
 * Handles both array data and nested object structures
 */
const processSnapshotToSummary = async (snapshot) => {
  try {
    const rawData = snapshot.rawData;
    let dataArray = [];
    let isNestedObject = false;

    // Handle different data structures
    if (Array.isArray(rawData)) {
      dataArray = rawData;
    } else if (typeof rawData === 'object' && rawData !== null) {
      // Check if it's a nested object with arrays (like procurement, finance)
      const keys = Object.keys(rawData);
      if (keys.length > 0 && Array.isArray(rawData[keys[0]])) {
        isNestedObject = true;
        // Flatten nested structure for processing
        keys.forEach(key => {
          if (Array.isArray(rawData[key])) {
            dataArray = dataArray.concat(rawData[key]);
          }
        });
      } else {
        // Single object
        dataArray = [rawData];
      }
    } else {
      dataArray = [rawData];
    }

    let metrics = {};
    let summaryType = '';

    switch (snapshot.moduleId) {
      case 1: // Inventory
        summaryType = 'inventory_summary';
        const totalItems = dataArray.length;
        const totalStockValue = dataArray.reduce((sum, item) => 
          sum + (item.quantity || 0) * (item.unitPrice || 10), 0); // Default unitPrice if not present
        const lowStockItems = dataArray.filter(item => (item.quantity || 0) < 50).length;
        metrics = {
          totalCount: totalItems,
          totalValue: totalStockValue,
          inventoryMetrics: {
            totalItems,
            totalStockValue,
            lowStockItems,
            outOfStockItems: dataArray.filter(item => (item.quantity || 0) === 0).length,
            averageQuantity: totalItems > 0 ? (dataArray.reduce((sum, item) => sum + (item.quantity || 0), 0) / totalItems).toFixed(2) : 0
          }
        };
        break;

      case 2: // Transaction
        summaryType = 'transaction_summary';
        const stockIn = dataArray.filter(t => t.type === 'stock-in').length;
        const stockOut = dataArray.filter(t => t.type === 'stock-out').length;
        const totalQuantity = dataArray.reduce((sum, t) => sum + (t.quantity || 0), 0);
        metrics = {
          totalCount: dataArray.length,
          totalValue: totalQuantity,
          breakdown: [
            { category: 'stock-in', count: stockIn, percentage: dataArray.length > 0 ? ((stockIn / dataArray.length) * 100).toFixed(2) : 0 },
            { category: 'stock-out', count: stockOut, percentage: dataArray.length > 0 ? ((stockOut / dataArray.length) * 100).toFixed(2) : 0 }
          ]
        };
        break;

      case 3: // Warehouse
        summaryType = 'warehouse_summary';
        const totalCapacity = dataArray.reduce((sum, w) => sum + (w.capacity || 0), 0);
        const totalCurrentStock = dataArray.reduce((sum, w) => sum + (w.currentStock || 0), 0);
        metrics = {
          totalCount: dataArray.length,
          totalValue: totalCapacity,
          breakdown: dataArray.map(w => ({
            category: w.name || 'Unknown',
            count: w.currentStock || 0,
            value: w.capacity || 0,
            percentage: w.capacity > 0 ? ((w.currentStock / w.capacity) * 100).toFixed(2) : 0
          }))
        };
        break;

      case 4: // Procurement
        summaryType = 'procurement_summary';
        // Handle nested structure
        const suppliers = rawData.suppliers || [];
        const requisitions = rawData.requisitions || [];
        const purchaseOrders = rawData.purchaseOrders || [];
        const invoices = rawData.invoices || [];
        const totalOrderValue = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount || 0), 0);
        const totalInvoiceValue = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
        
        metrics = {
          totalCount: suppliers.length + requisitions.length + purchaseOrders.length + invoices.length,
          procurementMetrics: {
            totalSuppliers: suppliers.length,
            totalRequisitions: requisitions.length,
            totalOrders: purchaseOrders.length,
            totalInvoices: invoices.length,
            totalOrderValue,
            totalInvoiceValue,
            pendingOrders: purchaseOrders.filter(po => po.status === 'pending').length,
            completedOrders: purchaseOrders.filter(po => po.status === 'delivered' || po.status === 'approved').length
          }
        };
        break;

      case 5: // Finance
        summaryType = 'finance_summary';
        // Handle nested structure
        const transactions = rawData.transactions || [];
        const financeInvoices = rawData.invoices || [];
        const totalRevenue = transactions.filter(t => t.type === 'revenue')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        const totalInvoiceAmount = financeInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
        
        metrics = {
          totalCount: transactions.length + financeInvoices.length,
          totalValue: totalRevenue,
          financeMetrics: {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            totalInvoices: financeInvoices.length,
            totalInvoiceAmount,
            paidInvoices: financeInvoices.filter(inv => inv.status === 'paid').length
          }
        };
        break;

      case 8: // Sales
        summaryType = 'sales_summary';
        const totalSales = dataArray.reduce((sum, s) => sum + parseFloat(s.totalAmount || 0), 0);
        const completedSales = dataArray.filter(s => s.status === 'completed').length;
        metrics = {
          totalCount: dataArray.length,
          totalValue: totalSales,
          salesMetrics: {
            totalSales,
            totalOrders: dataArray.length,
            averageOrderValue: dataArray.length > 0 ? (totalSales / dataArray.length).toFixed(2) : 0,
            completedOrders: completedSales,
            totalCustomers: new Set(dataArray.map(s => s.customerName)).size
          }
        };
        break;

      case 9: // Customer Service
        summaryType = 'customer_service_summary';
        const openTickets = dataArray.filter(t => t.status === 'open' || t.status === 'in-progress').length;
        const resolvedTickets = dataArray.filter(t => t.status === 'resolved' || t.status === 'closed').length;
        metrics = {
          totalCount: dataArray.length,
          breakdown: [
            { category: 'open', count: dataArray.filter(t => t.status === 'open').length },
            { category: 'in-progress', count: dataArray.filter(t => t.status === 'in-progress').length },
            { category: 'resolved', count: resolvedTickets },
            { category: 'closed', count: dataArray.filter(t => t.status === 'closed').length }
          ]
        };
        break;

      case 10: // HR
        summaryType = 'hr_summary';
        const totalPayroll = dataArray.reduce((sum, item) => sum + parseFloat(item.netPay || 0), 0);
        const totalGrossPay = dataArray.reduce((sum, item) => sum + parseFloat(item.grossPay || 0), 0);
        const totalDeductions = dataArray.reduce((sum, item) => sum + parseFloat(item.deductions || 0), 0);
        const uniqueEmployees = new Set(dataArray.map(item => item.employeeId)).size;
        const departments = new Set(dataArray.map(item => item.department)).size;
        
        metrics = {
          totalCount: dataArray.length,
          totalValue: totalPayroll,
          hrMetrics: {
            totalEmployees: uniqueEmployees,
            totalPayroll,
            totalGrossPay,
            totalDeductions,
            averagePay: dataArray.length > 0 ? (totalPayroll / dataArray.length).toFixed(2) : 0,
            departments: departments
          }
        };
        break;

      default:
        summaryType = `${MODULE_CONFIG[snapshot.moduleId]?.name.toLowerCase().replace(' ', '_')}_summary`;
        metrics = {
          totalCount: dataArray.length
        };
    }

    // Create or update summary
    const period = {
      startDate: snapshot.createdAt,
      endDate: new Date(),
      periodType: 'daily'
    };

    const summary = new BISummary({
      summaryType,
      moduleId: snapshot.moduleId,
      moduleName: snapshot.moduleName,
      period,
      metrics,
      dataReferences: [{
        sourceId: snapshot._id,
        sourceType: 'snapshot'
      }],
      lastUpdated: new Date()
    });

    await summary.save();
    return summary;
  } catch (error) {
    console.error("Error processing snapshot:", error);
    return null;
  }
};

/**
 * Get all summaries
 */
exports.getSummaries = async (req, res) => {
  try {
    const { moduleId, summaryType } = req.query;
    const query = {};
    if (moduleId) query.moduleId = parseInt(moduleId);
    if (summaryType) query.summaryType = summaryType;

    const summaries = await BISummary.find(query).sort({ lastUpdated: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all snapshots
 */
exports.getSnapshots = async (req, res) => {
  try {
    const { moduleId, snapshotType } = req.query;
    const query = {};
    if (moduleId) query.moduleId = parseInt(moduleId);
    if (snapshotType) query.snapshotType = snapshotType;

    const snapshots = await BIDataSnapshot.find(query)
      .select('snapshotName moduleId moduleName snapshotType metadata status createdAt')
      .sort({ createdAt: -1 });
    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get specific snapshot by ID
 */
exports.getSnapshotById = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await BIDataSnapshot.findById(id);
    
    if (!snapshot) {
      return res.status(404).json({ error: "Snapshot not found" });
    }
    
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a report structure
 */
exports.createReport = async (req, res) => {
  try {
    const report = new BIReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all reports
 */
exports.getReports = async (req, res) => {
  try {
    const reports = await BIReport.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate a comprehensive dashboard report
 */
exports.generateDashboard = async (req, res) => {
  try {
    // Get summaries from all modules
    const summaries = await BISummary.find().sort({ lastUpdated: -1 });
    
    // Get latest snapshots
    const snapshots = await BIDataSnapshot.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10);

    // Aggregate data
    const dashboard = {
      timestamp: new Date(),
      modules: {},
      overallMetrics: {
        totalModules: 8,
        activeModules: new Set(summaries.map(s => s.moduleId)).size,
        lastDataPull: snapshots[0]?.createdAt || null
      }
    };

    // Organize by module
    summaries.forEach(summary => {
      if (!dashboard.modules[summary.moduleId]) {
        dashboard.modules[summary.moduleId] = {
          moduleId: summary.moduleId,
          moduleName: summary.moduleName,
          summaries: []
        };
      }
      dashboard.modules[summary.moduleId].summaries.push({
        summaryType: summary.summaryType,
        metrics: summary.metrics,
        period: summary.period
      });
    });

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

