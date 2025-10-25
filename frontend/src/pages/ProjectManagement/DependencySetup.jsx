import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

const API_PROJECT = "http://localhost:8000/api/project";
const API_EMPLOYEE = "http://localhost:8000/api/employee";

export default function DependencySetup() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [employees, setEmployees] = useState([]);

  // Resource allocation states
  const [assignments, setAssignments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [equipment, setEquipment] = useState("");
  const [budget, setBudget] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [projectBudget, setProjectBudget] = useState("");

  // =============================
  // LOAD PROJECT + EMPLOYEES
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
        allTasks.push(task);
      });
    });

    setProject({ ...parsed, allTasks });
    setLoading(false);
    fetchEmployees();
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
  // RESOURCE ALLOCATION
  // =============================
  const addResource = () => {
    if (!selectedEmployee || !selectedTask || !budget.trim()) {
      alert("Please fill all required fields.");
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
          startDate: task.start, // Convert 'start' to 'startDate'
          endDate: task.end, // Convert 'end' to 'endDate'
          // Remove the temporary fields if needed
          start: undefined,
          end: undefined,
        })),
      }));

      const payload = {
        ...project,
        phases: processedPhases,
        totalBudget: parseFloat(projectBudget) || 0,
        resourceAllocations: assignments,
      };

      // Remove temporary fields from payload
      delete payload.allTasks;

      const res = await fetch(`${API_PROJECT}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Project and allocations saved!");
        localStorage.removeItem("newProjectDraft");
        setTimeout(() => navigate("/project-management"), 1200);
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
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

      {/* === Save Buttons === */}
      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => navigate("/project-management")}
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
