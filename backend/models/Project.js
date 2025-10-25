const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    code: { type: String }, // optional label like "#11"
    startDate: { type: Date },
    endDate: { type: Date },
    durationDays: { type: Number },
    assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
    dependencies: [{ type: Schema.Types.ObjectId }], // store other task _id values
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
  milestones: [{ name: String, dueDate: Date }],
  phases: [PhaseSchema],
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  budgetId: { type: String, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", ProjectSchema);
