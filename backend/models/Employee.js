const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  allocationType: {
    type: String,
    enum: ["Project", "Phase", "Task"],
    default: "Task",
  },
  workloadPercent: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true }, // e.g., EMP-001
    name: { type: String, required: true },
    position: { type: String }, // e.g., Full-Stack, Designer
    department: { type: String },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract"],
      default: "Full Time",
    },
    hireDate: { type: Date },
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
    allocations: [allocationSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
