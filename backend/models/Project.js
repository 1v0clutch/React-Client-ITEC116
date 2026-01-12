const mongoose = require("mongoose");
const { Schema } = mongoose;

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  const diffMs = Math.abs(e - s);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Material Requirement Schema
const MaterialRequirementSchema = new Schema({
  taskUid: { type: String },
  taskName: { type: String },
  phaseName: { type: String },
  itemId: { type: String },
  itemName: { type: String },
  quantity: { type: Number, default: 1 },
  source: {
    type: String,
    enum: ["inventory", "procurement"],
    default: "inventory",
  },
  estimatedCost: { type: Number, default: 0 },
  requiredDate: { type: Date },
  status: {
    type: String,
    enum: ["planned", "allocated", "ordered", "delivered", "cancelled"],
    default: "planned",
  },
});

// Task Schema
const TaskSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    durationDays: { type: Number, default: 0 },
    assignee: { type: String, default: "Unassigned" },
    dependencies: [{ type: String }],
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "On Hold"],
      default: "Not Started",
    },
    materials: [MaterialRequirementSchema], // Materials for this task
    estimatedCost: { type: Number, default: 0 }, // Estimated cost for this task
  },
  { _id: true }
);

// Phase Schema
const PhaseSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    tasks: [TaskSchema],
    estimatedCost: { type: Number, default: 0 }, // Estimated cost for this phase
  },
  { _id: true }
);

// Resource Allocation Schema
const ResourceAllocationSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: "Employee" },
  task: { type: Schema.Types.ObjectId },
  phase: { type: Schema.Types.ObjectId },
  equipment: { type: String, default: "" },
  budget: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  workloadPercent: { type: Number, min: 0, max: 100, default: 0 },
});

// Inventory Allocation Schema
const InventoryAllocationSchema = new Schema({
  itemId: { type: String, required: true },
  taskId: { type: Schema.Types.ObjectId },
  quantity: { type: Number, required: true },
  allocatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["allocated", "used", "returned", "cancelled"],
    default: "allocated",
  },
  cost: { type: Number, default: 0 },
});

// Main Project Schema
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["Planned", "In Progress", "Completed", "On Hold", "Cancelled"],
    default: "Planned",
  },
  phases: [PhaseSchema],

  // Budget Information
  totalBudget: { type: Number, default: 0 },
  estimatedMaterialCost: { type: Number, default: 0 },
  actualMaterialCost: { type: Number, default: 0 },

  // Resource Management
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  resourceAllocations: [ResourceAllocationSchema],

  // Material Management
  materialRequirements: [MaterialRequirementSchema],
  inventoryAllocations: [InventoryAllocationSchema],

  // Tracking
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save: compute task.durationDays from start/end and set phase start/end from tasks
ProjectSchema.pre("save", function (next) {
  try {
    if (this.phases && Array.isArray(this.phases)) {
      this.phases.forEach((phase) => {
        if (
          phase.tasks &&
          Array.isArray(phase.tasks) &&
          phase.tasks.length > 0
        ) {
          // compute task durations
          phase.tasks.forEach((task) => {
            task.durationDays = daysBetween(task.startDate, task.endDate);
          });

          // compute phase startDate = earliest task start
          const taskStarts = phase.tasks
            .map((t) => (t.startDate ? new Date(t.startDate).getTime() : null))
            .filter((v) => v !== null);
          const taskEnds = phase.tasks
            .map((t) => (t.endDate ? new Date(t.endDate).getTime() : null))
            .filter((v) => v !== null);

          if (taskStarts.length > 0) {
            const earliest = new Date(Math.min(...taskStarts));
            phase.startDate = earliest;
          }

          if (taskEnds.length > 0) {
            const latest = new Date(Math.max(...taskEnds));
            phase.endDate = latest;
          }
        } else {
          // no tasks: ensure duration/start/end remain as-is or zero
          phase.startDate = phase.startDate || null;
          phase.endDate = phase.endDate || null;
        }
      });

      // Optionally update project-level start/end from phases if desired
      const phaseStarts = this.phases
        .map((p) => (p.startDate ? new Date(p.startDate).getTime() : null))
        .filter((v) => v !== null);
      const phaseEnds = this.phases
        .map((p) => (p.endDate ? new Date(p.endDate).getTime() : null))
        .filter((v) => v !== null);

      if (phaseStarts.length > 0)
        this.startDate = new Date(Math.min(...phaseStarts));
      if (phaseEnds.length > 0) this.endDate = new Date(Math.max(...phaseEnds));
    }

    this.updatedAt = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

// Virtual for calculating total spent
ProjectSchema.virtual("totalSpent").get(function () {
  const laborCost = this.resourceAllocations.reduce(
    (sum, alloc) => sum + (alloc.budget || 0),
    0
  );
  const materialCost =
    this.actualMaterialCost || this.estimatedMaterialCost || 0;
  return laborCost + materialCost;
});

// Virtual for calculating budget variance
ProjectSchema.virtual("budgetVariance").get(function () {
  const spent = this.totalSpent;
  const budget = this.totalBudget || 0;
  return budget - spent;
});

// Virtual for calculating completion percentage
ProjectSchema.virtual("completionPercentage").get(function () {
  if (!this.phases || this.phases.length === 0) return 0;

  const totalTasks = this.phases.reduce(
    (sum, phase) => sum + (phase.tasks?.length || 0),
    0
  );
  if (totalTasks === 0) return 0;

  const completedTasks = this.phases.reduce((sum, phase) => {
    return (
      sum + (phase.tasks?.filter((t) => t.status === "Completed").length || 0)
    );
  }, 0);

  return Math.round((completedTasks / totalTasks) * 100);
});

module.exports = mongoose.model("Project", ProjectSchema);
