const mongoose = require("mongoose");

// Schema for storing raw data snapshots pulled from different modules
const BIDataSnapshotSchema = new mongoose.Schema({
  snapshotName: { type: String, required: true },
  moduleId: { type: Number, required: true }, // Source module number
  moduleName: { type: String, required: true },
  snapshotType: {
    type: String,
    enum: ['full_pull', 'incremental', 'dummy_data'],
    required: true
  },
  // Raw data from the module
  rawData: {
    type: mongoose.Schema.Types.Mixed, // Flexible structure to store any module data
    required: true
  },
  // Metadata about the data
  metadata: {
    recordCount: Number,
    dataFields: [String],
    sourceEndpoint: String,
    pullTimestamp: { type: Date, default: Date.now },
    dataVersion: String
  },
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingNotes: String,
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
BIDataSnapshotSchema.index({ moduleId: 1, createdAt: -1 });
BIDataSnapshotSchema.index({ snapshotType: 1, status: 1 });

module.exports = mongoose.model("BIDataSnapshot", BIDataSnapshotSchema);

