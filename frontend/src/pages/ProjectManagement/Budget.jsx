import React, { useState, useEffect } from "react";
import { FaSync, FaSave, FaTrash, FaEdit } from "react-icons/fa";

const API_PROJECT = "http://localhost:8000/api/project/projects";
const API_BUDGET = "http://localhost:8000/api/projectBudget";

export default function ProjectBudget() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [budgetData, setBudgetData] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(API_PROJECT);
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]._id);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // ✅ Fetch project budget
  const fetchBudget = async (projectId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BUDGET}/${projectId}`);
      if (res.status === 404) {
        setBudgetData(null);
        return;
      }
      const data = await res.json();
      setBudgetData(data);
    } catch (err) {
      console.error("Error fetching project budget:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sync project tasks from Project DB
  const syncBudget = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BUDGET}/${selectedProject}/sync`, {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        alert("Project budget synced successfully!");
        setBudgetData(result.projectBudget);
      } else {
        alert(result.message || "Sync failed");
      }
    } catch (err) {
      console.error("Error syncing:", err);
      alert("Error syncing project budget");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle local edit changes
  const handleChange = (taskId, field, value) => {
    setBudgetData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.taskId === taskId) {
          const updated = { ...t, [field]: value };
          const labor = parseFloat(updated.labor || 0);
          const materials = parseFloat(updated.materials || 0);
          updated.overhead = (labor + materials) * 0.1;
          updated.actualCost = labor + materials + updated.overhead;
          updated.variance = (updated.budgetEst || 0) - updated.actualCost;
          return updated;
        }
        return t;
      }),
    }));
  };

  // ✅ Save edited task to backend
  const saveTask = async (task) => {
    try {
      const res = await fetch(
        `${API_BUDGET}/${selectedProject}/task/${task.taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            labor: task.labor,
            materials: task.materials,
            status: task.status,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert("Task budget updated successfully!");
        setEditingTask(null);
        fetchBudget(selectedProject); // ✅ Refresh DB data
      } else {
        alert(result.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Error saving task changes");
    }
  };

  // ✅ Delete task from backend
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task from project budget?")) return;
    try {
      const res = await fetch(
        `${API_BUDGET}/${selectedProject}/task/${taskId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        alert("Task deleted successfully!");
        fetchBudget(selectedProject); // ✅ Refresh DB data
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error deleting task");
    }
  };

  // ✅ UI
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Project Budget Management
        </h1>

        {/* Project Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Select Project:
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchBudget(selectedProject)}
              className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              View
            </button>
            <button
              onClick={syncBudget}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <FaSync className="mr-2" /> Sync Budget
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : budgetData ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {budgetData.projectName} — Task Budgets
            </h2>

            {budgetData.tasks?.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks found.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Phase</th>
                    <th className="px-4 py-3 text-left">Task Name</th>
                    <th className="px-4 py-3 text-left">Budget Est.</th>
                    <th className="px-4 py-3 text-left">Labor</th>
                    <th className="px-4 py-3 text-left">Materials</th>
                    <th className="px-4 py-3 text-left">Overhead</th>
                    <th className="px-4 py-3 text-left">Actual Cost</th>
                    <th className="px-4 py-3 text-left">Variance</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetData.tasks.map((task) => (
                    <tr key={task.taskId} className="border-t">
                      <td className="px-4 py-3">{task.phaseName}</td>
                      <td className="px-4 py-3">{task.taskName}</td>
                      <td className="px-4 py-3">
                        ₱{parseFloat(task.budgetEst || 0).toLocaleString()}
                      </td>

                      {/* Editable fields */}
                      {["labor", "materials"].map((field) => (
                        <td key={field} className="px-4 py-3">
                          {editingTask === task.taskId ? (
                            <input
                              type="number"
                              value={task[field] || ""}
                              onChange={(e) =>
                                handleChange(task.taskId, field, e.target.value)
                              }
                              className="w-24 px-2 py-1 border rounded"
                            />
                          ) : (
                            <span>
                              ₱{parseFloat(task[field] || 0).toLocaleString()}
                            </span>
                          )}
                        </td>
                      ))}

                      <td className="px-4 py-3 text-gray-700">
                        ₱{parseFloat(task.overhead || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₱{parseFloat(task.actualCost || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₱{parseFloat(task.variance || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {editingTask === task.taskId ? (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleChange(
                                task.taskId,
                                "status",
                                e.target.value
                              )
                            }
                            className="px-2 py-1 border rounded"
                          >
                            <option>Planned</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Over Budget</option>
                          </select>
                        ) : (
                          <span
                            className={`font-semibold ${
                              task.status === "Completed"
                                ? "text-green-600"
                                : task.status === "Over Budget"
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {task.status}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center space-x-2">
                        {editingTask === task.taskId ? (
                          <button
                            onClick={() => saveTask(task)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            <FaSave />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingTask(task.taskId)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.taskId)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No budget data found. Click “Sync Budget”.
          </div>
        )}
      </div>
    </div>
  );
}
