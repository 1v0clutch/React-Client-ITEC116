import React, { useEffect, useState, useMemo } from "react";

const API_PROJECT = "http://localhost:8000/api/project";
const API_BUDGET = "http://localhost:8000/api/projectBudget";

function ProgressBar({ value, colorClass = "bg-green-500" }) {
  const pct = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div className={`${colorClass} h-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Not Started": "bg-gray-100 text-gray-700",
    "At Risk": "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        map[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}

function AlertCard({ title, description, type, timestamp }) {
  const bgColor =
    type === "DELAY"
      ? "bg-red-50 border-l-4 border-red-400"
      : type === "COST"
      ? "bg-yellow-50 border-l-4 border-yellow-400"
      : type === "RESOURCE"
      ? "bg-orange-50 border-l-4 border-orange-400"
      : type === "DATA"
      ? "bg-blue-50 border-l-4 border-blue-400"
      : "bg-gray-50 border-l-4 border-gray-400";

  const typeColor =
    type === "DELAY"
      ? "bg-red-100 text-red-700"
      : type === "COST"
      ? "bg-yellow-100 text-yellow-700"
      : type === "RESOURCE"
      ? "bg-orange-100 text-orange-700"
      : type === "DATA"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

  const getIcon = () => {
    switch (type) {
      case "DELAY":
        return "⚠️";
      case "COST":
        return "💸";
      case "RESOURCE":
        return "👤";
      case "DATA":
        return "📊";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`p-4 rounded ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded ${typeColor}`}>
              {type}
            </span>
            <span className="text-xs text-gray-500">{timestamp}</span>
          </div>
        </div>
        <span className="text-2xl">{getIcon()}</span>
      </div>
    </div>
  );
}

export default function Report({
  project: propProject = null,
  projectId = null,
}) {
  const [project, setProject] = useState(propProject);
  const [budget, setBudget] = useState(null);
  const [budgetTasks, setBudgetTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);

  useEffect(() => {
    setProject(propProject);
  }, [propProject]);

  useEffect(() => {
    let mounted = true;

    const fetchProject = async () => {
      if (propProject) return;
      setLoading(true);
      try {
        const url = projectId
          ? `${API_PROJECT}/${projectId}`
          : `${API_PROJECT}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (mounted) setProject(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Report fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProject();
    return () => {
      mounted = false;
    };
  }, [propProject, projectId]);

  // Fetch budget data when project changes
  useEffect(() => {
    let mounted = true;

    const fetchBudget = async () => {
      if (!project?._id && !project?.id) return;

      setBudgetLoading(true);
      try {
        const projId = project._id || project.id;
        console.log("Fetching budget for project:", projId);

        const res = await fetch(`${API_BUDGET}/${projId}`);
        console.log("Budget response status:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("Budget data received:", data);
          if (mounted) {
            setBudget(data);
            setBudgetTasks(data.tasks || []);
          }
        } else {
          console.warn("Budget not found or error");
          if (mounted) {
            setBudget(null);
            setBudgetTasks([]);
          }
        }
      } catch (err) {
        console.error("Budget fetch error:", err);
        if (mounted) {
          setBudget(null);
          setBudgetTasks([]);
        }
      } finally {
        if (mounted) setBudgetLoading(false);
      }
    };

    fetchBudget();
    return () => {
      mounted = false;
    };
  }, [project]);

  // Flatten all tasks from project phases
  const allTasks = useMemo(() => {
    if (!project || !Array.isArray(project.phases)) return [];
    return project.phases.flatMap((phase) =>
      (phase.tasks || []).map((task) => ({
        ...task,
        phaseName: phase.name,
      }))
    );
  }, [project]);

  // Calculate phase progress
  const phaseProgress = useMemo(() => {
    if (!project || !Array.isArray(project.phases)) return [];
    return project.phases.map((phase) => ({
      name: phase.name,
      progress: phase.progress || 0,
    }));
  }, [project]);

  // Fix the budget display function
  const getTaskBudget = (taskId) => {
    if (!taskId) return "₱0";
    const budgetTask = budgetMap[String(taskId)];
    console.log("Looking for task budget:", taskId, budgetTask);

    if (
      budgetTask &&
      budgetTask.budgetEst !== undefined &&
      budgetTask.budgetEst !== null
    ) {
      return `₱${Number(budgetTask.budgetEst).toLocaleString()}`;
    }

    // Fallback: check if task has its own budget field
    const task = allTasks.find((t) => (t._id || t.id) === taskId);
    if (task && task.budget !== undefined) {
      return `₱${Number(task.budget).toLocaleString()}`;
    }

    return "₱0";
  };

  // Fix the assignee name function
  const getAssigneeName = (assignee) => {
    console.log("Assignee data:", assignee);

    if (!assignee) return "Unassigned";

    // If assignee is an object with name property
    if (typeof assignee === "object") {
      return assignee.name || assignee.username || assignee.email || "Assigned";
    }

    // If assignee is a string (name or ID)
    if (typeof assignee === "string") {
      // If it looks like an ObjectId, return "Assigned", otherwise use the string
      return assignee.length === 24 && /^[0-9a-fA-F]+$/.test(assignee)
        ? "Assigned"
        : assignee;
    }

    return "Assigned";
  };

  // Create mapping of task IDs to budget info
  const budgetMap = useMemo(() => {
    const map = {};
    budgetTasks.forEach((budgetTask) => {
      if (budgetTask.taskId) {
        map[String(budgetTask.taskId)] = budgetTask;
      }
    });
    console.log("Budget map:", map);
    return map;
  }, [budgetTasks]);

  // Generate comprehensive alerts based on project data
  const alerts = useMemo(() => {
    const alertList = [];
    const today = new Date();

    // Check each task for issues
    allTasks.forEach((task) => {
      const taskProgress = task.progress || 0;
      const taskStatus = task.status || "Not Started";

      // Alert 1: Tasks behind schedule
      if (taskStatus === "In Progress" && taskProgress < 50 && task.endDate) {
        const endDate = new Date(task.endDate);
        const daysRemaining = Math.ceil(
          (endDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining < 3) {
          alertList.push({
            title: `${task.name} - Critical Delay`,
            description: `Only ${daysRemaining} days left but only ${taskProgress}% complete`,
            type: "DELAY",
            timestamp: new Date().toLocaleDateString(),
          });
        }
      }

      // Alert 2: Tasks without assignees
      if (!task.assignee || getAssigneeName(task.assignee) === "Unassigned") {
        alertList.push({
          title: `${task.name} - No Assignee`,
          description: "Task has not been assigned to any team member",
          type: "RESOURCE",
          timestamp: new Date().toLocaleDateString(),
        });
      }

      // Alert 3: Tasks with no budget
      const taskBudget = getTaskBudget(task._id || task.id);
      if (taskBudget === "₱0" || taskBudget === "N/A") {
        alertList.push({
          title: `${task.name} - Budget Not Set`,
          description: "Task budget has not been allocated",
          type: "COST",
          timestamp: new Date().toLocaleDateString(),
        });
      }

      // Alert 4: Overdue tasks
      if (
        task.endDate &&
        new Date(task.endDate) < today &&
        taskProgress < 100
      ) {
        alertList.push({
          title: `${task.name} - Overdue`,
          description: `Task is past deadline with ${taskProgress}% completion`,
          type: "DELAY",
          timestamp: new Date().toLocaleDateString(),
        });
      }
    });

    // Budget-related alerts
    if (budget) {
      const actualCost = budget.actualCost || budget.spent || 0;
      const allocatedBudget = budget.totalBudget || 1;
      const budgetUsage = (actualCost / allocatedBudget) * 100;

      if (budgetUsage > 90) {
        alertList.push({
          title: "Budget Nearly Exhausted",
          description: `Project has used ${Math.round(
            budgetUsage
          )}% of allocated budget`,
          type: "COST",
          timestamp: new Date().toLocaleDateString(),
        });
      }

      if (budgetUsage > 100) {
        alertList.push({
          title: "Budget Overrun",
          description: `Project has exceeded budget by ${Math.round(
            budgetUsage - 100
          )}%`,
          type: "COST",
          timestamp: new Date().toLocaleDateString(),
        });
      }
    }

    // Data mapping alerts
    if (budgetTasks.length === 0) {
      alertList.push({
        title: "Budget Data Not Loaded",
        description: "Task budget information is not available",
        type: "DATA",
        timestamp: new Date().toLocaleDateString(),
      });
    }

    // Sort alerts by priority (DELAY > COST > RESOURCE > DATA)
    const priorityOrder = { DELAY: 1, COST: 2, RESOURCE: 3, DATA: 4 };
    alertList.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return alertList.slice(0, 5);
  }, [allTasks, budget, budgetTasks]);

  // Calculate project metrics based on actual data
  const metrics = useMemo(() => {
    const totalTasks = allTasks.length || 1;
    const completedTasks = allTasks.filter(
      (t) => t.status === "Completed"
    ).length;
    const inProgressTasks = allTasks.filter(
      (t) => t.status === "In Progress"
    ).length;

    const scopeCompletion = Math.round((completedTasks / totalTasks) * 100);
    const timePerformance = Math.round(
      ((completedTasks + inProgressTasks * 0.5) / totalTasks) * 100
    );

    // Calculate cost performance from budget database
    let costPerformance = 85;
    let budgetUsed = "N/A";
    let totalBudget = "N/A";
    let variance = 0;

    if (budget) {
      // Budget from ProjectBudget model - use actualCost directly
      const actualCost = budget.actualCost || budget.spent || 0;
      const allocatedBudget = budget.totalBudget || 1;

      budgetUsed = `₱${Number(actualCost).toLocaleString()}`;
      totalBudget = `₱${Number(allocatedBudget).toLocaleString()}`;
      variance = allocatedBudget - actualCost;

      // Calculate cost performance percentage (how much budget is left)
      costPerformance = Math.round(
        ((allocatedBudget - actualCost) / allocatedBudget) * 100
      );

      console.log("Cost metrics:", {
        actualCost,
        allocatedBudget,
        variance,
        costPerformance,
      });
    } else if (project?.totalBudget) {
      // Fallback to project-level budget
      const projBudgetUsed = project.budgetUsed || 0;
      budgetUsed = `₱${Number(projBudgetUsed).toLocaleString()}`;
      totalBudget = `₱${Number(project.totalBudget).toLocaleString()}`;
      variance = project.totalBudget - projBudgetUsed;
      costPerformance = Math.round(
        ((project.totalBudget - projBudgetUsed) / project.totalBudget) * 100
      );
    }

    return {
      scopeCompletion,
      timePerformance,
      costPerformance,
      tasksDone: `${completedTasks}/${totalTasks}`,
      daysElapsed: project?.startDate
        ? Math.ceil(
            (new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
          )
        : 0,
      daysTotal:
        project?.startDate && project?.endDate
          ? Math.ceil(
              (new Date(project.endDate) - new Date(project.startDate)) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
      budgetUsed,
      totalBudget,
      variance,
    };
  }, [allTasks, project, budget]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    if (isNaN(d)) return "N/A";
    return d.toISOString().slice(0, 10);
  };

  // Add debugging logs
  console.log("Budget tasks from API:", budgetTasks);
  console.log("Budget map:", budgetMap);
  console.log("All tasks:", allTasks);
  console.log("Generated alerts:", alerts);

  if (loading || budgetLoading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading report{budgetLoading ? " and budget data" : ""}...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Progress Monitoring & Reporting
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time project performance dashboard
          </p>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Performance */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>⏰</span>
            <span>Time Performance</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {metrics.timePerformance}%
          </div>
          <div className="mt-3">
            <ProgressBar
              value={metrics.timePerformance}
              colorClass="bg-blue-500"
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <div>
              <div>Days Elapsed</div>
              <div className="font-semibold">
                {metrics.daysElapsed}/{metrics.daysTotal}
              </div>
            </div>
            <div className="text-right">
              <div>Variance</div>
              <div className="font-semibold text-red-600">-5%</div>
            </div>
          </div>
        </div>

        {/* Cost Performance */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>💲</span>
            <span>Cost Performance</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {metrics.costPerformance}%
          </div>
          <div className="mt-3">
            <ProgressBar
              value={metrics.costPerformance}
              colorClass="bg-green-500"
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <div>
              <div>Budget Used</div>
              <div className="font-semibold">{metrics.budgetUsed}</div>
            </div>
            <div className="text-right">
              <div>Total Budget</div>
              <div className="font-semibold">{metrics.totalBudget}</div>
            </div>
          </div>
        </div>

        {/* Scope Performance */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>🎯</span>
            <span>Scope Performance</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {metrics.scopeCompletion}%
          </div>
          <div className="mt-3">
            <ProgressBar
              value={metrics.scopeCompletion}
              colorClass="bg-purple-500"
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <div>
              <div>Tasks Done</div>
              <div className="font-semibold">{metrics.tasksDone}</div>
            </div>
            <div className="text-right">
              <div>Completion</div>
              <div className="font-semibold">{metrics.scopeCompletion}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Progress Report & Active Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Progress Report */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Task Progress Report
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    TASK
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    PHASE
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    PROGRESS
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    BUDGET
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    TIMELINE
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    ASSIGNEE
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 pb-3">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {allTasks.slice(0, 5).map((task, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 text-gray-800 font-medium">
                      {task.name}
                    </td>
                    <td className="py-3 text-blue-600 text-sm">
                      {task.phaseName}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <ProgressBar
                            value={task.progress || 0}
                            colorClass="bg-blue-500"
                          />
                        </div>
                        <span className="text-xs font-semibold">
                          {task.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600 text-xs font-medium">
                      {getTaskBudget(task._id || task.id)}
                    </td>
                    <td className="py-3 text-gray-600 text-xs">
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </td>
                    <td className="py-3 text-gray-600 text-xs">
                      {getAssigneeName(task.assignee)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={task.status || "Not Started"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Alerts - Now with fixed height and scroll */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Alerts
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-96">
            {" "}
            {/* Added scrollable container */}
            <div className="space-y-3 pr-2">
              {" "}
              {/* Added padding for scrollbar */}
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => <AlertCard key={idx} {...alert} />)
              ) : (
                <div className="text-sm text-gray-500 text-center py-6">
                  No active alerts
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress by Phase */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Progress by Phase
        </h2>
        <div className="space-y-4">
          {phaseProgress.map((phase, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {phase.name}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {phase.progress}%
                </span>
              </div>
              <ProgressBar
                value={phase.progress}
                colorClass={
                  phase.progress === 100
                    ? "bg-green-500"
                    : phase.progress >= 75
                    ? "bg-blue-500"
                    : phase.progress >= 50
                    ? "bg-yellow-500"
                    : "bg-orange-500"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
