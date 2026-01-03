const mongoose = require("mongoose");

// Schema for storing summarized/aggregated data from different modules
const BISummarySchema = new mongoose.Schema({
  summaryType: {
    type: String,
    enum: [
      'inventory_summary',
      'transaction_summary',
      'warehouse_summary',
      'procurement_summary',
      'finance_summary',
      'hr_summary',
      'sales_summary',
      'customer_service_summary'
    ],
    required: true
  },
  moduleId: { type: Number, required: true }, // Source module number
  moduleName: { type: String, required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    periodType: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] }
  },
  // Aggregated metrics
  metrics: {
    totalCount: Number,
    totalValue: Number,
    averageValue: Number,
    minValue: Number,
    maxValue: Number,
    // Module-specific metrics
    inventoryMetrics: {
      totalItems: Number,
      totalStockValue: Number,
      lowStockItems: Number,
      outOfStockItems: Number
    },
    procurementMetrics: {
      totalOrders: Number,
      totalOrderValue: Number,
      pendingOrders: Number,
      completedOrders: Number
    },
    financeMetrics: {
      totalRevenue: Number,
      totalExpenses: Number,
      netProfit: Number,
      totalInvoices: Number
    },
    hrMetrics: {
      totalEmployees: Number,
      totalPayroll: Number,
      averageAttendance: Number,
      totalLeaves: Number
    },
    salesMetrics: {
      totalSales: Number,
      totalOrders: Number,
      averageOrderValue: Number,
      totalCustomers: Number
    }
  },
  // Breakdown by category/status
  breakdown: [{
    category: String,
    count: Number,
    value: Number,
    percentage: Number
  }],
  // Raw data references (IDs from source modules)
  dataReferences: [{
    sourceId: mongoose.Schema.Types.ObjectId,
    sourceType: String
  }],
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for efficient querying
BISummarySchema.index({ summaryType: 1, 'period.startDate': 1, 'period.endDate': 1 });

module.exports = mongoose.model("BISummary", BISummarySchema);

