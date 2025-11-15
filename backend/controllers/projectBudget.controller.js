const Project = require("../models/Project");
const ProjectBudget = require("../models/ProjectBudget");

// ✅ Sync all tasks from Project
exports.syncProjectBudget = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("resourceAllocations.employee", "name")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = [];
    for (const alloc of project.resourceAllocations || []) {
      let phaseName = "Unassigned";
      let taskName = "Unknown Task";

      for (const phase of project.phases || []) {
        const foundTask = phase.tasks.find(
          (t) => String(t._id) === String(alloc.task)
        );
        if (foundTask) {
          phaseName = phase.name;
          taskName = foundTask.name;
          break;
        }
      }

      tasks.push({
        taskId: alloc.task,
        projectName: project.name,
        phaseName,
        taskName,
        budgetEst: alloc.budget || 0,
        labor: 0,
        materials: 0,
        overhead: 0,
        actualCost: 0,
        variance: alloc.budget || 0,
        status: "Planned",
      });
    }

    let budget = await ProjectBudget.findOne({ project: projectId });
    if (budget) {
      budget.projectName = project.name;
      budget.tasks = tasks;
    } else {
      budget = new ProjectBudget({
        project: projectId,
        projectName: project.name,
        totalBudget: project.totalBudget || 0,
        tasks,
      });
    }

    await budget.save();
    res
      .status(200)
      .json({ message: "Project budget synced", projectBudget: budget });
  } catch (err) {
    console.error("Error syncing project budget:", err);
    res.status(500).json({ message: "Failed to sync project budget" });
  }
};

// Helper: Calculate total actualCost from all tasks
const calculateTotalActualCost = (tasks) => {
  return tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
};

// Get project budget
exports.getBudgetByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const budget = await ProjectBudget.findOne({ project: projectId });
    if (!budget)
      return res.status(404).json({ message: "Project budget not found" });

    // Calculate total actualCost from all tasks
    const totalActualCost = calculateTotalActualCost(budget.tasks || []);

    res.status(200).json({
      ...budget.toObject(),
      actualCost: totalActualCost,
      spent: totalActualCost, // alias for frontend
      variance: (budget.totalBudget || 0) - totalActualCost,
    });
  } catch (err) {
    console.error("Error fetching project budget:", err);
    res.status(500).json({ message: "Failed to fetch project budget" });
  }
};

// ✅ Update a task record (computes actualCost, overhead, variance)
exports.updateTaskBudget = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { labor, materials, status } = req.body;

    const budget = await ProjectBudget.findOne({ project: projectId });
    if (!budget)
      return res.status(404).json({ message: "Project budget not found" });

    const task = budget.tasks.find((t) => String(t.taskId) === taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.labor = parseFloat(labor) || 0;
    task.materials = parseFloat(materials) || 0;
    task.overhead = (task.labor + task.materials) * 0.1;
    task.actualCost = task.labor + task.materials + task.overhead;
    task.variance = (task.budgetEst || 0) - task.actualCost;
    task.status = status || task.status;

    await budget.save();
    res.status(200).json({ message: "Task updated", task });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Failed to update task" });
  }
};

// ✅ Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const budget = await ProjectBudget.findOne({ project: projectId });
    if (!budget)
      return res.status(404).json({ message: "Project budget not found" });

    budget.tasks = budget.tasks.filter((t) => String(t.taskId) !== taskId);
    await budget.save();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
