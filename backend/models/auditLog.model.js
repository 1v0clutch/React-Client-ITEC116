const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    user: { type: String },          // username or userId
    role: { type: String },          // Admin, Finance
    action: { type: String },        // VIEW_REPORT, EXPORT_REPORT
    module: { type: String },        // ERP Report Module
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
