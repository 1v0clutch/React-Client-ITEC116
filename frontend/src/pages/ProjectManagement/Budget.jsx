import React, { useState, useEffect } from "react";
import {
  FaSync,
  FaSave,
  FaEdit,
  FaTrash,
  FaBox,
  FaMoneyBillWave,
  FaChartBar,
} from "react-icons/fa";

const API_BUDGET = "http://localhost:8000/api/projectBudget";
const API_INVENTORY = "http://localhost:8000/api/inventory";
const API_PROCUREMENT = "http://localhost:8000/api/procurement";
const API_PROJECT = "http://localhost:8000/api/project";

export default function ProjectBudget({ project }) {
  const [budgetData, setBudgetData] = useState(null);
  const [materialData, setMaterialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTasks, setEditedTasks] = useState({});
  const [isSynced, setIsSynced] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [procurementRequisitions, setProcurementRequisitions] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    itemId: "",
    quantity: "",
    source: "inventory",
    estimatedCost: "",
  });

  // ✅ Fetch all data when project changes
  useEffect(() => {
    if (project?._id) {
      fetchAllData(project._id);
    }
  }, [project]);

  // ✅ Fetch all related data
  const fetchAllData = async (projectId) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBudget(projectId),
        fetchMaterialCosts(projectId),
        fetchInventoryItems(),
        fetchProjectRequisitions(projectId),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch project budget
  const fetchBudget = async (projectId) => {
    try {
      const res = await fetch(`${API_BUDGET}/${projectId}`);
      if (res.status === 404) {
        setBudgetData(null);
        return;
      }
      const data = await res.json();
      setBudgetData(data);
      if (data?.tasks && data.tasks.length > 0) {
        setIsSynced(true);
      }
    } catch (err) {
      console.error("Error fetching project budget:", err);
    }
  };

  // ✅ Fetch material costs
  const fetchMaterialCosts = async (projectId) => {
    try {
      const res = await fetch(
        `${API_PROJECT}/${projectId}/budget/material-costs`
      );
      if (res.ok) {
        const data = await res.json();
        setMaterialData(data);
      }
    } catch (err) {
      console.error("Error fetching material costs:", err);
      // If material costs endpoint fails, use budget data
      if (budgetData?.tasks) {
        const totalMaterialCost = budgetData.tasks.reduce(
          (sum, task) => sum + parseFloat(task.materials || 0),
          0
        );

        setMaterialData({
          totalMaterialCost,
          materialBreakdown: budgetData.tasks
            .filter((task) => parseFloat(task.materials || 0) > 0)
            .map((task) => ({
              taskId: task.taskId,
              item: `Materials for ${task.taskName}`,
              quantity: 1,
              cost: parseFloat(task.materials || 0),
              source: "budget",
              status: "allocated",
            })),
        });
      }
    }
  };

  // ✅ Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const res = await fetch(`${API_INVENTORY}/getItems`);
      if (res.ok) {
        const data = await res.json();
        setInventoryItems(data);
      }
    } catch (err) {
      console.error("Error fetching inventory items:", err);
    }
  };

  // ✅ Fetch procurement requisitions
  const fetchProjectRequisitions = async (projectId) => {
    try {
      const res = await fetch(
        `${API_PROCUREMENT}/requisitions/project/${projectId}`
      );
      if (res.ok) {
        const data = await res.json();
        setProcurementRequisitions(data);
      }
    } catch (err) {
      console.error("Error fetching requisitions:", err);
    }
  };

  // ✅ Sync from project DB
  const syncBudget = async () => {
    if (!project?._id) return alert("No project selected.");
    try {
      setLoading(true);
      const res = await fetch(`${API_BUDGET}/${project._id}/sync`, {
        method: "POST",
      });
      const result = await res.json();
      if (res.ok) {
        alert("Project budget synced successfully!");
        setBudgetData(result.projectBudget);
        setIsSynced(true);
        // Refresh material data after sync
        fetchMaterialCosts(project._id);
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

  // ✅ Open material request modal
  const openMaterialRequest = (task) => {
    setSelectedTask(task);
    setMaterialForm({
      itemId: "",
      quantity: "",
      source: "inventory",
      estimatedCost: "",
    });
    setShowMaterialModal(true);
  };

  // ✅ Submit material request
  const submitMaterialRequest = async () => {
    if (!materialForm.itemId || !materialForm.quantity) {
      alert("Please select item and quantity");
      return;
    }

    try {
      setLoading(true);

      if (materialForm.source === "inventory") {
        // Allocate from inventory
        const res = await fetch(`${API_INVENTORY}/allocate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: materialForm.itemId,
            quantity: materialForm.quantity,
            projectId: project._id,
            taskId: selectedTask.taskId,
            allocationType: "project_task",
          }),
        });

        if (res.ok) {
          alert("Materials allocated from inventory!");
          // Refresh material data
          fetchMaterialCosts(project._id);
        }
      } else {
        // Create procurement requisition
        const res = await fetch(`${API_PROCUREMENT}/requisitions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project._id,
            taskId: selectedTask.taskId,
            itemId: materialForm.itemId,
            quantity: materialForm.quantity,
            estimatedCost: materialForm.estimatedCost,
            priority: "High",
            status: "pending",
          }),
        });

        if (res.ok) {
          alert("Procurement requisition created!");
          // Refresh procurement data
          fetchProjectRequisitions(project._id);
        }
      }

      setShowMaterialModal(false);
      fetchInventoryItems();
    } catch (err) {
      console.error("Error submitting material request:", err);
      alert("Error processing material request");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel edit mode
  const cancelEditMode = () => {
    setEditMode(false);
    setEditedTasks({});
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
      fetchAllData(project._id);
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
        fetchAllData(project._id);
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Error deleting task");
    }
  };

  // Calculate totals with material costs
  const calculateTotals = () => {
    if (!budgetData?.tasks || budgetData.tasks.length === 0) {
      return {
        budgetEst: 0,
        labor: 0,
        materials: 0,
        materialCost: 0,
        overhead: 0,
        actualCost: 0,
        variance: 0,
        totalBudget: 0,
      };
    }

    const totals = budgetData.tasks.reduce(
      (totals, task) => {
        // ✅ Get material cost directly from the task's materials field
        const taskMaterialCost = parseFloat(task.materials || 0);

        return {
          budgetEst: totals.budgetEst + parseFloat(task.budgetEst || 0),
          labor: totals.labor + parseFloat(task.labor || 0),
          materials: totals.materials + taskMaterialCost,
          materialCost: totals.materialCost + taskMaterialCost,
          overhead: totals.overhead + parseFloat(task.overhead || 0),
          actualCost: totals.actualCost + parseFloat(task.actualCost || 0),
          variance: totals.variance + parseFloat(task.variance || 0),
        };
      },
      {
        budgetEst: 0,
        labor: 0,
        materials: 0,
        materialCost: 0,
        overhead: 0,
        actualCost: 0,
        variance: 0,
      }
    );

    // ✅ Use the totalBudget from budgetData (which should come from project)
    const totalBudget = budgetData?.totalBudget || 0;

    return {
      ...totals,
      totalBudget, // Total project budget from the project
    };
  };

  const totals = calculateTotals();

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
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                <FaEdit /> Edit
              </button>
            ) : (
              <button
                onClick={saveAllChanges}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                <FaSave /> Update Project
              </button>
            )}
            <button
              onClick={syncBudget}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FaSync /> Sync Budget
            </button>
          </div>
        </div>

        {/* Overview cards removed */}

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : budgetData ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {budgetData.projectName} — Task Budgets
              </h2>
              <div className="text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                  Total Tasks: {budgetData.tasks?.length || 0}
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    totals.variance < 0
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  Variance: ₱{totals.variance.toLocaleString()}
                </span>
              </div>
            </div>

            {budgetData.tasks?.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
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
                                  ₱
                                  {parseFloat(
                                    task[field] || 0
                                  ).toLocaleString()}
                                </span>
                              )}
                            </td>
                          ))}

                          <td className="px-4 py-3 text-gray-700">
                            ₱{parseFloat(task.overhead || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="font-medium">
                              ₱
                              {parseFloat(
                                task.actualCost || 0
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <span
                              className={
                                parseFloat(task.variance || 0) < 0
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600"
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
                                    : "text-blue-600"
                                }`}
                              >
                                {task.status}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openMaterialRequest(task)}
                                className="text-blue-600 hover:text-blue-800 transition"
                                title="Request Materials"
                                disabled={editMode}
                              >
                                <FaBox />
                              </button>
                              <button
                                onClick={() => deleteTask(task.taskId)}
                                className="text-red-600 hover:text-red-800 transition"
                                disabled={editMode}
                              >
                                <FaTrash />
                              </button>
                            </div>
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
                          <span
                            className={
                              totals.variance < 0
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {totals.variance < 0
                              ? "OVER BUDGET"
                              : "WITHIN BUDGET"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No budget data found. Click “Sync Budget”.
          </div>
        )}

        {/* Material Breakdown Section */}
        {materialData &&
          materialData.materialBreakdown &&
          materialData.materialBreakdown.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Material Cost Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-left">Item</th>
                      <th className="px-4 py-3 text-left">Quantity</th>
                      <th className="px-4 py-3 text-left">Cost</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialData.materialBreakdown.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.source === "inventory"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {item.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.item}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3 font-medium">
                          ₱{item.cost.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              item.status === "approved" ||
                              item.status === "allocated"
                                ? "bg-green-100 text-green-800"
                                : item.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.taskId ? `Task ${item.taskId}` : "Project-wide"}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                      <td className="px-4 py-3" colSpan="3">
                        TOTAL MATERIAL COST
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        ₱
                        {materialData.totalMaterialCost?.toLocaleString() ||
                          totals.materials.toLocaleString()}
                      </td>
                      <td className="px-4 py-3" colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </div>

      {/* Material Request Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Request Materials for {selectedTask?.taskName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Source
                </label>
                <select
                  value={materialForm.source}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, source: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="inventory">From Inventory</option>
                  <option value="procurement">New Procurement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Item
                </label>
                <select
                  value={materialForm.itemId}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, itemId: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Item</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} (Stock: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={materialForm.quantity}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      quantity: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />
              </div>

              {materialForm.source === "procurement" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Cost (₱)
                  </label>
                  <input
                    type="number"
                    value={materialForm.estimatedCost}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        estimatedCost: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitMaterialRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
