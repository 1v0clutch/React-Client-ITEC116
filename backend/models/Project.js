const mongoose = require("mongoose");
const { Schema } = mongoose;

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  const diffMs = Math.abs(e - s);
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const TaskSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    // removed `code` field — use the task _id when you need a code/identifier
    startDate: { type: Date },
    endDate: { type: Date },
    durationDays: { type: Number, default: 0 },
    assignee: { type: String, default: "Unassigned" },
    dependencies: [{ type: String }], // store other task _id values
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
  },
  { _id: true }
);

const PhaseSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    position: { type: Number, default: 0 },
    tasks: [TaskSchema],
  },
  { _id: true }
);

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  startDate: { type: Date },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["Planned", "In Progress", "Completed", "On Hold"],
    default: "Planned",
  },
  // removed milestones per request
  phases: [PhaseSchema],
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  budgetId: { type: String, default: null },
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

module.exports = mongoose.model("Project", ProjectSchema);
