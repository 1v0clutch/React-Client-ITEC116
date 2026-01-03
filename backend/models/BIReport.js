const mongoose = require("mongoose");

// Schema for storing report structures and configurations
const BIReportSchema = new mongoose.Schema({
  reportName: { type: String, required: true },
  reportType: { 
    type: String, 
    enum: [
      'inventory_summary',
      'procurement_summary',
      'finance_summary',
      'hr_summary',
      'sales_summary',
      'customer_service_summary',
      'comprehensive_dashboard',
      'custom'
    ],
    required: true 
  },
  description: String,
  moduleSources: [{
    moduleId: { type: Number, required: true }, // Module number (1,2,3,4,5,8,9,10)
    moduleName: String,
    dataFields: [String] // Fields to include from this module
  }],
  reportStructure: {
    sections: [{
      sectionName: String,
      dataFields: [String],
      aggregationType: { type: String, enum: ['sum', 'average', 'count', 'max', 'min', 'list'] }
    }]
  },
  filters: {
    dateRange: {
      startDate: Date,
      endDate: Date
    },
    categories: [String],
    status: [String]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("BIReport", BIReportSchema);

