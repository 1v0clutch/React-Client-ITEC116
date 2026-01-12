const Project = require("../models/Project");
const ProjectBudget = require("../models/ProjectBudget");
const axios = require("axios");

// Inventory & Procurement APIs
const INVENTORY_API = "http://localhost:8000/api/inventory";
const PROCUREMENT_API = "http://localhost:8000/api/procurement";

// ✅ Sync all tasks from Project
// ✅ Helper: Calculate total actualCost from all tasks
const calculateTotalActualCost = (tasks) => {
  return tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
};

// ✅ Helper: Calculate material costs from inventory and procurement
const calculateMaterialCosts = async (projectId, tasks) => {
  try {
    let totalMaterialCost = 0;
    const materialBreakdown = [];

    // Fetch procurement costs for this project
    try {
      const procurementRes = await axios.get(
        `${PROCUREMENT_API}/requisitions/project/${projectId}`
      );
      const procurementReqs = procurementRes.data || [];

      procurementReqs.forEach((req) => {
        if (req.status === "approved" || req.status === "completed") {
          const cost = req.estimatedCost || req.totalCost || 0;
          totalMaterialCost += cost;
          materialBreakdown.push({
            source: "procurement",
            item: req.itemId?.name || "Unknown",
            quantity: req.quantity,
            cost: cost,
            status: req.status,
          });
        }
      });
    } catch (err) {
      console.error("Error fetching procurement data:", err.message);
    }

    // Fetch inventory allocation costs for this project
    try {
      const project = await Project.findById(projectId);
      if (project && project.inventoryAllocations) {
        for (const allocation of project.inventoryAllocations) {
          // Get item price from inventory
          try {
            const itemRes = await axios.get(
              `${INVENTORY_API}/getItem/${allocation.itemId}`
            );
            const item = itemRes.data;
            const cost = (item.price || 0) * allocation.quantity;
            totalMaterialCost += cost;
            materialBreakdown.push({
              source: "inventory",
              item: item.name,
              quantity: allocation.quantity,
              cost: cost,
              status: "allocated",
            });
          } catch (err) {
            console.error(
              `Error fetching item ${allocation.itemId}:`,
              err.message
            );
          }
        }
      }
    } catch (err) {
      console.error("Error fetching inventory allocations:", err.message);
    }

    // Update task materials costs
    const updatedTasks = tasks.map((task) => {
      // Find materials for this task
      const taskMaterials = materialBreakdown.filter(
        (m) => m.source === "inventory" && m.taskId === task.taskId
      );

      const taskMaterialCost = taskMaterials.reduce(
        (sum, m) => sum + m.cost,
        0
      );

      return {
        ...task,
        materialsCost: taskMaterialCost,
        // Update actual cost if materials cost is significant
        actualCost: task.actualCost + taskMaterialCost,
      };
    });

    return {
      totalMaterialCost,
      materialBreakdown,
      updatedTasks,
    };
  } catch (err) {
    console.error("Error calculating material costs:", err);
    return {
      totalMaterialCost: 0,
      materialBreakdown: [],
      updatedTasks: tasks,
    };
  }
};

// ✅ NEW: Get project material status (ADD THIS MISSING FUNCTION)
exports.getProjectMaterialStatus = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch project budget
    const budget = await ProjectBudget.findOne({ project: projectId });

    // Calculate material costs
    const materialData = await calculateMaterialCosts(
      projectId,
      budget?.tasks || []
    );

    // Fetch material requirements from project
    const materialRequirements = project.materialRequirements || [];

    // Fetch inventory allocations
    let inventoryAllocations = [];
    try {
      const invRes = await axios.get(
        `${INVENTORY_API}/allocations/project/${projectId}`
      );
      inventoryAllocations = invRes.data || [];
    } catch (err) {
      console.error("Error fetching inventory allocations:", err.message);
    }

    res.status(200).json({
      projectId,
      projectName: project.name,
      totalMaterialCost: materialData.totalMaterialCost,
      materialBreakdown: materialData.materialBreakdown,
      materialRequirements,
      inventoryAllocations,
      budget: budget?.totalBudget || 0,
      spentOnMaterials: materialData.totalMaterialCost,
      remainingBudget:
        (budget?.totalBudget || 0) - materialData.totalMaterialCost,
    });
  } catch (err) {
    console.error("Error fetching project material status:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch project material status" });
  }
};

// ✅ NEW: Get ALL project budgets for FinanceHead dashboard
exports.getAllProjectBudgets = async (req, res) => {
  try {
    const budgets = await ProjectBudget.find({})
      .select("projectName project totalBudget tasks updatedAt createdAt")
      .lean();

    // Calculate total actual cost and other metrics for each project
    const budgetsWithTotals = await Promise.all(
      budgets.map(async (budget) => {
        const tasks = budget.tasks || [];

        // Calculate material costs
        const materialData = await calculateMaterialCosts(
          budget.project,
          tasks
        );

        const totalActualCost = calculateTotalActualCost(
          materialData.updatedTasks
        );
        const totalBudgetEst = tasks.reduce(
          (sum, task) => sum + (task.budgetEst || 0),
          0
        );

        // Calculate status dynamically
        const completedTasks = tasks.filter(
          (t) => t.status === "Completed"
        ).length;
        const totalTasks = tasks.length;
        let status = "Active";

        if (totalTasks > 0 && completedTasks === totalTasks) {
          status = "Completed";
        } else if (tasks.some((t) => t.status === "Over Budget")) {
          status = "Over Budget";
        }

        return {
          _id: budget._id,
          id: budget._id,
          projectName: budget.projectName || `Project ${budget._id}`,
          totalActualCost,
          totalBudget: totalBudgetEst,
          variance: totalBudgetEst - totalActualCost,
          materialCost: materialData.totalMaterialCost,
          status,
          tasks: materialData.updatedTasks,
          materialBreakdown: materialData.materialBreakdown,
          updatedAt: budget.updatedAt || budget.createdAt,
          createdAt: budget.createdAt,
        };
      })
    );

    res.status(200).json(budgetsWithTotals);
  } catch (err) {
    console.error("Error fetching all project budgets:", err);
    res.status(500).json({ message: "Failed to fetch project budgets" });
  }
};

// Sync all tasks from Project
exports.syncProjectBudget = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("resourceAllocations.employee", "name")
      .lean();

    if (!project) return res.status(404).json({ message: "Project not found" });

    // ✅ Get total project budget from project
    const totalBudget = project.totalBudget || 0;

    // ✅ Get estimated material cost from project
    const estimatedMaterialCost = project.estimatedMaterialCost || 0;

    const tasks = [];
    for (const alloc of project.resourceAllocations || []) {
      let phaseName = "Unassigned";
      let taskName = "Unknown Task";
      let taskMaterialsCost = 0;

      for (const phase of project.phases || []) {
        const foundTask = phase.tasks.find(
          (t) => String(t._id) === String(alloc.task)
        );
        if (foundTask) {
          phaseName = phase.name;
          taskName = foundTask.name;

          // ✅ Calculate material cost for this specific task
          if (project.materialRequirements) {
            const taskMaterials = project.materialRequirements.filter(
              (m) => m.taskUid === String(alloc.task)
            );
            taskMaterialsCost = taskMaterials.reduce(
              (sum, m) => sum + (m.estimatedCost || 0) * (m.quantity || 1),
              0
            );
          }
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
        materials: taskMaterialsCost, // ✅ Include actual material cost
        materialsCost: taskMaterialsCost,
        overhead: 0,
        actualCost: 0,
        variance: alloc.budget || 0 - taskMaterialsCost, // ✅ Adjust variance
        status: "Planned",
      });
    }

    let budget = await ProjectBudget.findOne({ project: projectId });
    if (budget) {
      budget.projectName = project.name;
      budget.totalBudget = totalBudget; // ✅ Ensure total budget is set
      budget.tasks = tasks;
      budget.estimatedMaterialCost = estimatedMaterialCost;
      budget.materialCost = estimatedMaterialCost; // ✅ Store material cost separately
    } else {
      budget = new ProjectBudget({
        project: projectId,
        projectName: project.name,
        totalBudget: totalBudget, // ✅ Use project's total budget
        estimatedMaterialCost: estimatedMaterialCost,
        materialCost: estimatedMaterialCost, // ✅ Store material cost
        tasks,
      });
    }

    await budget.save();
    res.status(200).json({
      message: "Project budget synced",
      projectBudget: budget,
      totalMaterialCost: estimatedMaterialCost, // ✅ Return material cost
    });
  } catch (err) {
    console.error("Error syncing project budget:", err);
    res.status(500).json({ message: "Failed to sync project budget" });
  }
};

// ✅ Get project budget
exports.getBudgetByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const budget = await ProjectBudget.findOne({ project: projectId });
    if (!budget)
      return res.status(404).json({ message: "Project budget not found" });
    res.status(200).json(budget);

    // Calculate material costs
    const materialData = await calculateMaterialCosts(
      projectId,
      budget.tasks || []
    );

    // Update budget with material costs
    budget.tasks = materialData.updatedTasks;
    budget.materialCost = materialData.totalMaterialCost;
    budget.materialBreakdown = materialData.materialBreakdown;

    // Calculate total actualCost from all tasks
    const totalActualCost = calculateTotalActualCost(budget.tasks || []);

    res.status(200).json({
      ...budget.toObject(),
      actualCost: totalActualCost,
      spent: totalActualCost, // alias for frontend
      variance: (budget.totalBudget || 0) - totalActualCost,
      materialCost: materialData.totalMaterialCost,
      materialBreakdown: materialData.materialBreakdown,
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

// ✅ NEW: Update material costs for a task
exports.updateTaskMaterialCost = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { materialCost, materialBreakdown } = req.body;

    const budget = await ProjectBudget.findOne({ project: projectId });
    if (!budget)
      return res.status(404).json({ message: "Project budget not found" });

    const task = budget.tasks.find((t) => String(t.taskId) === taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.materials = parseFloat(materialCost) || task.materials;
    task.materialsCost = parseFloat(materialCost) || task.materialsCost;
    task.materialBreakdown = materialBreakdown || task.materialBreakdown;

    // Recalculate totals
    task.overhead = (task.labor + task.materials) * 0.1;
    task.actualCost = task.labor + task.materials + task.overhead;
    task.variance = (task.budgetEst || 0) - task.actualCost;

    await budget.save();
    res.status(200).json({ message: "Material costs updated", task });
  } catch (err) {
    console.error("Error updating material costs:", err);
    res.status(500).json({ message: "Failed to update material costs" });
  }
};

// ✅ NEW: Get procurement status for a project
exports.getProjectProcurementStatus = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch procurement data
    const response = await axios.get(
      `${PROCUREMENT_API}/requisitions/project/${projectId}`
    );
    const procurementData = response.data || [];

    res.status(200).json({
      projectId,
      procurementRequisitions: procurementData,
      totalRequisitions: procurementData.length,
      pendingRequisitions: procurementData.filter((r) => r.status === "pending")
        .length,
      approvedRequisitions: procurementData.filter(
        (r) => r.status === "approved"
      ).length,
      totalCost: procurementData.reduce(
        (sum, r) => sum + (r.estimatedCost || 0),
        0
      ),
    });
  } catch (err) {
    console.error("Error fetching procurement status:", err);
    res.status(500).json({ message: "Failed to fetch procurement status" });
  }
};
