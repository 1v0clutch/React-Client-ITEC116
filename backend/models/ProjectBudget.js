const mongoose = require("mongoose");
const { Schema } = mongoose;

// Each task cost record
const TaskBudgetSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task" },
  phaseName: String,
  taskName: String,
  projectName: String,

  // Cost tracking
  budgetEst: { type: Number, default: 0 }, // from project.resourceAllocations
  labor: { type: Number, default: 0 },
  materials: { type: Number, default: 0 },
  overhead: { type: Number, default: 0 },
  actualCost: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Planned", "In Progress", "Completed", "Over Budget"],
    default: "Planned",
  },
});

const ProjectBudgetSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  projectName: { type: String },
  totalBudget: { type: Number, default: 0 },
  tasks: [TaskBudgetSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProjectBudgetSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  this.totalBudget = this.tasks.reduce(
    (sum, t) => sum + (t.actualCost || 0),
    0
  );
  next();
});

module.exports = mongoose.model("ProjectBudget", ProjectBudgetSchema);
