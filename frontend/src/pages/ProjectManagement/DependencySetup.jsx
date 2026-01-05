import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaSave, FaBox, FaShoppingCart } from "react-icons/fa";

const API_PROJECT = "http://localhost:8000/api/project";
const API_EMPLOYEE = "http://localhost:8000/api/employee";
const API_INVENTORY = "http://localhost:8000/api/inventory";
const API_PROCUREMENT = "http://localhost:8000/api/procurement";

export default function DependencySetup() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  // Resource allocation states
  const [assignments, setAssignments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [equipment, setEquipment] = useState("");
  const [budget, setBudget] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [projectBudget, setProjectBudget] = useState("");

  // Material planning states
  const [materialRequests, setMaterialRequests] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    taskUid: "",
    itemId: "",
    quantity: "",
    source: "inventory", // inventory or procurement
    estimatedCost: "",
    requiredDate: "",
  });

  // =============================
  // LOAD PROJECT + EMPLOYEES + INVENTORY
  // =============================
  useEffect(() => {
    const draft = localStorage.getItem("newProjectDraft");
    if (!draft) {
      setMessage("⚠️ No project draft found. Please create a project first.");
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(draft);

    // Flatten tasks for easy dependency assignment
    let counter = 1;
    const allTasks = [];
    parsed.phases.forEach((phase, pIndex) => {
      phase.tasks.forEach((task, tIndex) => {
        task._uid = counter++;
        task.phaseIndex = pIndex;
        task.taskIndex = tIndex;
        task.dependencies = [];
        task.materials = []; // Add materials array to each task
        allTasks.push(task);
      });
    });

    setProject({ ...parsed, allTasks });
    setLoading(false);
    fetchEmployees();
    fetchInventoryItems();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_EMPLOYEE);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

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

  // =============================
  // DEPENDENCY SETUP
  // =============================
  const handleDependencyChange = (taskUid, selectedIds) => {
    setProject((prev) => {
      const updatedTasks = prev.allTasks.map((task) =>
        task._uid === taskUid ? { ...task, dependencies: selectedIds } : task
      );

      const updatedPhases = prev.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((t) => {
          const updated = updatedTasks.find((x) => x._uid === t._uid);
          return updated || t;
        }),
      }));

      return { ...prev, allTasks: updatedTasks, phases: updatedPhases };
    });
  };

  // =============================
  // MATERIAL PLANNING
  // =============================
  const openMaterialForm = (taskUid) => {
    const task = project?.allTasks.find((t) => t._uid === Number(taskUid));
    setMaterialForm({
      taskUid: taskUid,
      itemId: "",
      quantity: "",
      source: "inventory",
      estimatedCost: "",
      requiredDate: task?.end || "",
    });
    setShowMaterialForm(true);
  };

  const addMaterialRequest = async () => {
    if (
      !materialForm.taskUid ||
      !materialForm.itemId ||
      !materialForm.quantity
    ) {
      alert("Please fill all required fields");
      return;
    }

    const task = project.allTasks.find(
      (t) => t._uid === Number(materialForm.taskUid)
    );
    const item = inventoryItems.find((i) => i._id === materialForm.itemId);

    if (!item) {
      alert("Selected item not found");
      return;
    }

    const newRequest = {
      id: Date.now(),
      taskUid: materialForm.taskUid,
      taskName: task.name,
      phaseName: project.phases[task.phaseIndex]?.name,
      itemId: materialForm.itemId,
      itemName: item.name,
      quantity: parseFloat(materialForm.quantity),
      source: materialForm.source,
      estimatedCost: materialForm.estimatedCost || item.price,
      requiredDate: materialForm.requiredDate,
      status: "planned",
    };

    setMaterialRequests((prev) => [...prev, newRequest]);

    // Update task materials in project data
    setProject((prev) => {
      const updatedTasks = prev.allTasks.map((t) =>
        t._uid === Number(materialForm.taskUid)
          ? { ...t, materials: [...(t.materials || []), newRequest] }
          : t
      );

      const updatedPhases = prev.phases.map((phase, pIndex) => ({
        ...phase,
        tasks: phase.tasks.map((t, tIndex) => {
          const updated = updatedTasks.find(
            (x) => x.phaseIndex === pIndex && x.taskIndex === tIndex
          );
          return updated || t;
        }),
      }));

      return { ...prev, allTasks: updatedTasks, phases: updatedPhases };
    });

    setMaterialForm({
      taskUid: "",
      itemId: "",
      quantity: "",
      source: "inventory",
      estimatedCost: "",
      requiredDate: "",
    });
    setShowMaterialForm(false);
  };

  const removeMaterialRequest = (requestId) => {
    setMaterialRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  // =============================
  // RESOURCE ALLOCATION
  // =============================
  const addResource = () => {
    if (!selectedEmployee || !selectedTask || !budget.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    // 🚫 Prevent assigning employee who is on leave
    const selectedEmp = employees.find((e) => e._id === selectedEmployee);
    if (
      selectedEmp &&
      (selectedEmp.status?.toLowerCase() === "on leave" ||
        selectedEmp.onLeave === true)
    ) {
      alert(
        "You cannot assign a task to an employee who is currently on leave."
      );
      return;
    }

    const emp = employees.find((e) => e._id === selectedEmployee);
    const task = project?.allTasks.find((t) => t._uid === Number(selectedTask));

    const newEntry = {
      employeeId: emp._id,
      employeeName: emp.name,
      taskUid: task._uid,
      taskName: task.name,
      phaseName: project.phases[task.phaseIndex]?.name,
      equipment,
      budget: parseFloat(budget),
      startDate: task.start,
      endDate: task.end,
    };

    setAssignments((prev) => [...prev, newEntry]);
    clearForm();
  };

  const clearForm = () => {
    setSelectedEmployee("");
    setSelectedTask("");
    setEquipment("");
    setBudget("");
    setEditingIndex(null);
  };

  const deleteResource = (i) => {
    setAssignments((prev) => prev.filter((_, idx) => idx !== i));
  };

  const startEdit = (i) => {
    const a = assignments[i];
    setSelectedEmployee(a.employeeId);
    setSelectedTask(a.taskUid);
    setEquipment(a.equipment);
    setBudget(a.budget);
    setEditingIndex(i);
  };

  const saveEdit = () => {
    // Prevent saving edit with an employee who's on leave
    const selectedEmp = employees.find((e) => e._id === selectedEmployee);
    if (
      selectedEmp &&
      (selectedEmp.status?.toLowerCase() === "on leave" ||
        selectedEmp.onLeave === true)
    ) {
      alert(
        "You cannot assign a task to an employee who is currently on leave."
      );
      return;
    }

    setAssignments((prev) =>
      prev.map((a, i) =>
        i === editingIndex
          ? {
              ...a,
              employeeId: selectedEmployee,
              taskUid: selectedTask,
              equipment,
              budget: parseFloat(budget),
            }
          : a
      )
    );
    clearForm();
  };

  // =============================
  // SAVE PROJECT
  // =============================
  const saveToDatabase = async () => {
    try {
      // Process phases to convert date field names
      const processedPhases = project.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) => ({
          ...task,
          startDate: task.start,
          endDate: task.end,
          materials: task.materials || [], // Include materials
          start: undefined,
          end: undefined,
        })),
      }));

      const payload = {
        ...project,
        phases: processedPhases,
        totalBudget: parseFloat(projectBudget) || 0,
        resourceAllocations: assignments,
        materialRequirements: materialRequests,
      };

      delete payload.allTasks;

      const res = await fetch(`${API_PROJECT}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Project and allocations saved!");

        // Create procurement requisitions for materials
        const procurementReqs = materialRequests.filter(
          (m) => m.source === "procurement"
        );
        for (const req of procurementReqs) {
          await fetch(`${API_PROCUREMENT}/requisitions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: data.projectId,
              taskId: req.taskUid,
              itemId: req.itemId,
              quantity: req.quantity,
              estimatedCost: req.estimatedCost,
              requiredDate: req.requiredDate,
              priority: "High",
              status: "pending",
            }),
          });
        }

        localStorage.removeItem("newProjectDraft");
        setTimeout(() => navigate("/project-management/project"), 1200);
      } else {
        setMessage(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  // =============================
  // RENDER
  // =============================
  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading project…</div>
    );

  if (!project)
    return (
      <div className="p-6 text-center text-red-600">
        No project draft found. Go back to Project Form.
      </div>
    );

  const totalBudget = assignments.reduce((sum, a) => sum + (a.budget || 0), 0);
  const totalMaterialCost = materialRequests.reduce(
    (sum, m) => sum + m.estimatedCost * m.quantity,
    0
  );

  return (
    <div className="w-full p-6 space-y-6">
      <h2 className="text-lg font-semibold text-orange-600">
        Step 2: Task Dependencies & Resource Allocation
      </h2>

      {message && (
        <div className="p-3 border rounded bg-gray-50 text-sm flex justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage("")} className="text-red-600">
            ×
          </button>
        </div>
      )}

      {/* === Project Summary === */}
      <div className="border p-4 rounded bg-gray-50">
        <div className="font-medium">{project.name}</div>
        <div className="text-sm text-gray-600">
          {project.startDate} → {project.endDate}
        </div>
        <div className="text-sm">{project.description}</div>
      </div>

      {/* === Dependencies Table === */}
      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Task Name</th>
              <th className="px-4 py-2 text-left">Phase</th>
              <th className="px-4 py-2 text-left">Dependencies</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Materials</th>
            </tr>
          </thead>
          <tbody>
            {project.allTasks.map((task) => (
              <tr key={task._uid} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{`#${task._uid}`}</td>
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">
                  {project.phases[task.phaseIndex]?.name}
                </td>
                <td className="px-4 py-2">
                  <select
                    multiple
                    value={task.dependencies}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(
                        (o) => Number(o.value)
                      );
                      handleDependencyChange(task._uid, values);
                    }}
                    className="border rounded px-2 py-1 text-sm w-full"
                  >
                    <option value="">(none)</option>
                    {project.allTasks
                      .filter((t) => t._uid !== task._uid)
                      .map((t) => (
                        <option key={t._uid} value={t._uid}>
                          #{t._uid} {t.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="px-4 py-2">{task.start}</td>
                <td className="px-4 py-2">{task.end}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => openMaterialForm(task._uid)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <FaBox size={12} />
                    Add Materials
                  </button>
                  {task.materials && task.materials.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {task.materials.length} item(s)
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === Material Planning Section === */}
      {materialRequests.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">
            Material Requirements
          </h3>
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Task</th>
                  <th className="px-3 py-2 text-left">Material</th>
                  <th className="px-3 py-2 text-left">Quantity</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Est. Cost</th>
                  <th className="px-3 py-2 text-left">Required By</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materialRequests.map((req) => (
                  <tr key={req.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {req.phaseName} → {req.taskName}
                    </td>
                    <td className="px-3 py-2">{req.itemName}</td>
                    <td className="px-3 py-2">{req.quantity}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          req.source === "inventory"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {req.source}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      ₱{(req.estimatedCost * req.quantity).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{req.requiredDate}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeMaterialRequest(req.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-3 py-2" colSpan="4">
                    Total Material Cost
                  </td>
                  <td className="px-3 py-2">
                    ₱{totalMaterialCost.toLocaleString()}
                  </td>
                  <td className="px-3 py-2" colSpan="2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === Resource Allocation Section === */}
      <div className="border-t pt-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">
          Resource Allocation
        </h3>

        {/* Project Budget */}
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm text-gray-600">
            Total Project Budget (₱)
          </label>
          <input
            type="number"
            value={projectBudget}
            onChange={(e) => setProjectBudget(e.target.value)}
            placeholder="Enter total budget"
            className="border rounded-md px-3 py-2 text-sm w-64"
          />
          <div className="text-gray-500 text-sm">
            Allocated: ₱{totalBudget.toLocaleString()}
            {totalMaterialCost > 0 && (
              <span className="ml-2">
                | Materials: ₱{totalMaterialCost.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Allocation Form */}
        <div className="grid md:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500">Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border rounded-md px-2 py-2 text-sm"
            >
              <option value="">Select Employee</option>
              {employees.map((e) => {
                const isOnLeave =
                  e.status?.toLowerCase() === "on leave" || e.onLeave === true;
                return (
                  <option
                    key={e._id}
                    value={e._id}
                    disabled={isOnLeave}
                    className={isOnLeave ? "text-gray-400 italic" : ""}
                  >
                    {e.name}
                    {isOnLeave ? " (On Leave)" : ""}
                  </option>
                );
              })}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {
                employees.filter(
                  (e) =>
                    e.status?.toLowerCase() === "on leave" || e.onLeave === true
                ).length
              }{" "}
              employees are currently on leave
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full border rounded-md px-2 py-2 text-sm"
            >
              <option value="">Select Task</option>
              {project.allTasks.map((t) => (
                <option key={t._uid} value={t._uid}>
                  {project.phases[t.phaseIndex]?.name} → {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500">Equipment</label>
            <input
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g. Laptop"
              className="w-full border rounded-md px-2 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Budget (₱)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="w-full border rounded-md px-2 py-2 text-sm"
            />
          </div>

          <div>
            <button
              onClick={editingIndex !== null ? saveEdit : addResource}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm"
            >
              {editingIndex !== null ? <FaSave /> : <FaPlus />}
              {editingIndex !== null ? "Save" : "Add"}
            </button>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Task</th>
                <th className="px-3 py-2 text-left">Equipment</th>
                <th className="px-3 py-2 text-left">Budget</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-gray-400">
                    No allocations yet.
                  </td>
                </tr>
              ) : (
                assignments.map((a, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{a.employeeName}</td>
                    <td className="px-3 py-2">
                      {a.phaseName} → {a.taskName}
                    </td>
                    <td className="px-3 py-2">{a.equipment}</td>
                    <td className="px-3 py-2">₱{a.budget.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {a.startDate} → {a.endDate}
                    </td>
                    <td className="px-3 py-2 flex justify-center gap-3">
                      <button
                        onClick={() => startEdit(i)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteResource(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Request Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Add Material Requirement
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={materialForm.source}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, source: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="inventory">From Existing Inventory</option>
                  <option value="procurement">Need to Procure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Material
                </label>
                <select
                  value={materialForm.itemId}
                  onChange={(e) => {
                    const selectedItem = inventoryItems.find(
                      (i) => i._id === e.target.value
                    );
                    setMaterialForm({
                      ...materialForm,
                      itemId: e.target.value,
                      estimatedCost: selectedItem?.price || "",
                    });
                  }}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Material</option>
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} {item.sku && `(${item.sku})`} - Stock:{" "}
                      {item.quantity}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Unit Cost (₱)
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
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required By
                </label>
                <input
                  type="date"
                  value={materialForm.requiredDate}
                  onChange={(e) =>
                    setMaterialForm({
                      ...materialForm,
                      requiredDate: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowMaterialForm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={addMaterialRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Save Buttons === */}
      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => navigate("/project-management/form")}
          className="border px-4 py-2 rounded text-sm"
        >
          ← Back
        </button>
        <button
          onClick={saveToDatabase}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          <FaSave className="inline mr-1" /> Save Project & Resources
        </button>
      </div>
    </div>
  );
}
