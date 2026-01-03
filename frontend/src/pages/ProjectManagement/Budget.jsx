import React, { useState, useEffect } from "react";
import { FaSync, FaSave, FaEdit, FaTrash } from "react-icons/fa";

const API_BUDGET = "http://localhost:8000/api/projectBudget";

export default function ProjectBudget({ project }) {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTasks, setEditedTasks] = useState({});
  const [isSynced, setIsSynced] = useState(false);

  // ✅ Fetch budget when project changes
  useEffect(() => {
    if (project?._id) {
      fetchBudget(project._id);
    }
  }, [project]);

  // ✅ Fetch project budget
  const fetchBudget = async (projectId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BUDGET}/${projectId}`);
      if (res.status === 404) {
        setBudgetData(null);
        setIsSynced(false);
        return;
      }
      const data = await res.json();
      setBudgetData(data);
      // Check if budget already has data (means it was synced before)
      if (data?.tasks && data.tasks.length > 0) {
        setIsSynced(true);
      }
    } catch (err) {
      console.error("Error fetching project budget:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sync from project DB
  const syncBudget = async () => {
    if (!project?._id) return alert("No project selected.");
    if (isSynced) return alert("Budget already synced!");

    try {
      setLoading(true);
      const res = await fetch(`${API_BUDGET}/${project._id}/sync`, {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        alert("Project budget synced successfully!");
        setBudgetData(result.projectBudget);
        setIsSynced(true); // Disable sync button after successful sync
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

  // ✅ Cancel edit mode
  const cancelEditMode = () => {
    setEditMode(false);
    setEditedTasks({});
    // Refresh data to discard any unsaved changes
    if (project?._id) {
      fetchBudget(project._id);
    }
  };

  // ✅ Handle edits
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

          // mark edited
          setEditedTasks((prevEdited) => ({
            ...prevEdited,
            [taskId]: updated,
          }));

          return updated;
        }
        return t;
      }),
    }));
  };

  // ✅ Save all edited tasks
  const saveAllChanges = async () => {
    if (!project?._id) return alert("No project selected.");
    if (Object.keys(editedTasks).length === 0) {
      alert("No changes to save.");
      setEditMode(false);
      return;
    }

    try {
      setLoading(true);
      const updates = Object.values(editedTasks);

      for (const task of updates) {
        const res = await fetch(
          `${API_BUDGET}/${project._id}/task/${task.taskId}`,
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
        if (!res.ok) {
          console.error(`Failed to update task ${task.taskName}`);
        }
      }

      alert("All task budgets updated successfully!");
      setEditMode(false);
      setEditedTasks({});
      fetchBudget(project._id);
    } catch (err) {
      console.error("Error updating tasks:", err);
      alert("Error updating project budget");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task from project budget?")) return;
    try {
      const res = await fetch(`${API_BUDGET}/${project._id}/task/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Task deleted successfully!");
        fetchBudget(project._id);
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error deleting task");
    }
  };

  // ✅ Calculate totals
  const calculateTotals = () => {
    if (!budgetData?.tasks || budgetData.tasks.length === 0) {
      return {
        budgetEst: 0,
        labor: 0,
        materials: 0,
        overhead: 0,
        actualCost: 0,
        variance: 0,
      };
    }

    return budgetData.tasks.reduce(
      (totals, task) => {
        return {
          budgetEst: totals.budgetEst + parseFloat(task.budgetEst || 0),
          labor: totals.labor + parseFloat(task.labor || 0),
          materials: totals.materials + parseFloat(task.materials || 0),
          overhead: totals.overhead + parseFloat(task.overhead || 0),
          actualCost: totals.actualCost + parseFloat(task.actualCost || 0),
          variance: totals.variance + parseFloat(task.variance || 0),
        };
      },
      {
        budgetEst: 0,
        labor: 0,
        materials: 0,
        overhead: 0,
        actualCost: 0,
        variance: 0,
      }
    );
  };

  const totals = calculateTotals();

  // ✅ UI
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Project Budget Management
          </h1>
          <div className="flex gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!budgetData?.tasks || budgetData.tasks.length === 0}
              >
                <FaEdit /> Edit
              </button>
            ) : (
              <>
                <button
                  onClick={saveAllChanges}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <FaSave /> Save Changes
                </button>
                <button
                  onClick={cancelEditMode}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={syncBudget}
              className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition ${
                isSynced
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isSynced}
            >
              <FaSync /> {isSynced ? "Already Synced" : "Sync Budget"}
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
              <>
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
                      <tr
                        key={task.taskId}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{task.phaseName}</td>
                        <td className="px-4 py-3">{task.taskName}</td>
                        <td className="px-4 py-3">
                          ₱{parseFloat(task.budgetEst || 0).toLocaleString()}
                        </td>

                        {/* Editable fields */}
                        {["labor", "materials"].map((field) => (
                          <td key={field} className="px-4 py-3">
                            {editMode ? (
                              <input
                                type="number"
                                value={task[field] || ""}
                                onChange={(e) =>
                                  handleChange(
                                    task.taskId,
                                    field,
                                    e.target.value
                                  )
                                }
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400"
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
                          <span
                            className={
                              parseFloat(task.variance || 0) < 0
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            ₱{parseFloat(task.variance || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          {editMode ? (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleChange(
                                  task.taskId,
                                  "status",
                                  e.target.value
                                )
                              }
                              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-400"
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

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteTask(task.taskId)}
                            className="text-red-600 hover:text-red-800 transition"
                            disabled={editMode}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="border-t-2 border-gray-800 font-bold bg-gray-50">
                      <td className="px-4 py-3" colSpan="2">
                        TOTAL
                      </td>
                      <td className="px-4 py-3">
                        ₱{totals.budgetEst.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ₱{totals.labor.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ₱{totals.materials.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ₱{totals.overhead.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        ₱{totals.actualCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            totals.variance < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          ₱{totals.variance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3" colSpan="2">
                        {totals.variance < 0 ? "OVER BUDGET" : "WITHIN BUDGET"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No budget data found. Click "Sync Budget" to create budget from
            project tasks.
          </div>
        )}
      </div>
    </div>
  );
}
