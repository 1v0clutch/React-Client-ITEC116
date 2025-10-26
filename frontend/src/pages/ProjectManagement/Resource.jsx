import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaDollarSign,
  FaPlus,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaEdit,
  FaSave,
} from "react-icons/fa";

const API_PROJECT = "http://localhost:8000/api/project";
const API_EMPLOYEE = "http://localhost:8000/api/employee";

export default function ResourceAllocationUI({ project }) {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editResource, setEditResource] = useState(null);

  const [formData, setFormData] = useState({
    taskId: "",
    employeeId: "",
    equipment: "",
    budget: "",
  });

  useEffect(() => {
    if (project?._id) {
      fetchEmployees();
    }
  }, [project]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(API_EMPLOYEE);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);

      // Now that we have employees, fetch project resources
      if (project?._id) {
        await fetchProjectResources(project._id, data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Error loading employees: " + error.message);
    }
  };

  const fetchProjectResources = async (
    projectId,
    employeesList = employees
  ) => {
    try {
      setLoading(true);
      console.log("Fetching allocations for project:", projectId);

      const allocationsRes = await fetch(
        `${API_PROJECT}/projects/${projectId}/allocations`
      );
      if (!allocationsRes.ok) throw new Error("Failed to fetch allocations");

      const allocationsData = await allocationsRes.json();
      console.log("Allocations data:", allocationsData);

      const projectDataRes = await fetch(
        `${API_PROJECT}/projects/${projectId}`
      );
      if (!projectDataRes.ok) throw new Error("Failed to fetch project data");

      const projectData = await projectDataRes.json();
      console.log("Project data:", projectData);

      if (
        allocationsData.resourceAllocations &&
        Array.isArray(allocationsData.resourceAllocations)
      ) {
        const resourcesWithDetails = allocationsData.resourceAllocations.map(
          (alloc) => {
            console.log("Processing allocation:", alloc);

            // Find employee - handle both object and ID formats
            const employee = employeesList.find(
              (emp) =>
                emp._id === alloc.employee?._id || emp._id === alloc.employee
            );

            console.log("Found employee:", employee);

            let taskName = "Unknown Task";
            let phaseName = "Unknown Phase";

            if (projectData.phases && Array.isArray(projectData.phases)) {
              for (const phase of projectData.phases) {
                if (phase.tasks && Array.isArray(phase.tasks)) {
                  const task = phase.tasks.find(
                    (t) => String(t._id) === String(alloc.task)
                  );
                  if (task) {
                    taskName = task.name;
                    phaseName = phase.name;
                    break;
                  }
                }
              }
            }

            const resource = {
              id: alloc._id || `${alloc.employee}-${alloc.task}`,
              taskName,
              phaseName,
              employee: employee ? employee.name : "Unknown Employee",
              employeeId: alloc.employee?._id || alloc.employee,
              taskId: alloc.task,
              equipment: alloc.equipment || "No equipment",
              budget: alloc.budget || 0,
              workload: calculateWorkload(
                alloc.employee?._id || alloc.employee,
                employeesList
              ),
            };

            console.log("Created resource:", resource);
            return resource;
          }
        );
        setResources(resourcesWithDetails);
        console.log("Final resources:", resourcesWithDetails);
      } else {
        console.log("No resource allocations found");
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      alert("Error loading allocations: " + error.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const getAllTasks = () => {
    if (!project || !project.phases) return [];
    return project.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        ...task,
        phaseName: phase.name,
      }))
    );
  };

  const calculateWorkload = (employeeId, employeesList = employees) => {
    const employee = employeesList.find((emp) => emp._id === employeeId);
    if (employee && Array.isArray(employee.allocations)) {
      const allocationCount = employee.allocations.length;
      return Math.min(allocationCount * 20, 100);
    }

    const allocationCount = resources.filter(
      (r) => r.employeeId === employeeId
    ).length;
    return Math.min(allocationCount * 20, 100);
  };

  const getWorkloadStatus = (workload) => {
    if (workload >= 80)
      return { color: "text-red-600 bg-red-50", text: "Overloaded" };
    if (workload >= 60)
      return { color: "text-orange-600 bg-orange-50", text: "High" };
    if (workload >= 40)
      return { color: "text-yellow-600 bg-yellow-50", text: "Medium" };
    return { color: "text-green-600 bg-green-50", text: "Low" };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!project?._id) return alert("No project selected");
    if (!formData.taskId || !formData.employeeId || !formData.budget)
      return alert("Please fill in all required fields");

    const selectedEmp = employees.find((e) => e._id === formData.employeeId);
    const isOnLeave =
      selectedEmp?.onLeave === true ||
      (selectedEmp?.status && selectedEmp.status.toLowerCase() === "on leave");

    if (isOnLeave) {
      alert(
        "You cannot assign a task to an employee who is currently on leave."
      );
      return;
    }

    try {
      const payload = {
        employeeId: formData.employeeId,
        taskId: formData.taskId,
        equipment: formData.equipment || "No equipment specified",
        budget: parseFloat(formData.budget),
      };

      console.log("Submitting payload:", payload);

      let url = `${API_PROJECT}/projects/${project._id}/allocations`;
      let method = "POST";

      if (editResource) {
        url = `${API_PROJECT}/projects/${project._id}/allocations/${editResource.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        console.log("Server response:", result);

        // Refresh the data
        await fetchEmployees();
        resetForm();
        setShowForm(false);
        setEditResource(null);
        alert(
          editResource
            ? "Resource updated successfully!"
            : "Resource allocated successfully!"
        );
      } else {
        const errorText = await res.text();
        console.error("Server error response:", errorText);
        let errorMessage = "Failed to save allocation";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        alert(`Failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (resourceId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this resource allocation?"
      )
    )
      return;

    try {
      const res = await fetch(
        `${API_PROJECT}/projects/${project._id}/allocations/${resourceId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        // Refresh both employees and resources
        await fetchEmployees();
        alert("Resource allocation deleted successfully!");
      } else {
        const result = await res.json();
        alert(`Failed to delete: ${result.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting allocation: " + error.message);
    }
  };

  const resetForm = () =>
    setFormData({
      taskId: "",
      employeeId: "",
      equipment: "",
      budget: "",
    });

  const startEdit = (resource) => {
    console.log("Editing resource:", resource);
    setFormData({
      taskId: resource.taskId,
      employeeId: resource.employeeId,
      equipment: resource.equipment,
      budget: resource.budget.toString(),
    });
    setEditResource(resource);
    setShowForm(true);
  };

  const tasks = getAllTasks();
  const totalBudget = resources.reduce((sum, r) => sum + (r.budget || 0), 0);
  const overloadedEmployees = resources.filter((r) => r.workload >= 80).length;

  const selectedEmployeeWorkload = formData.employeeId
    ? calculateWorkload(formData.employeeId)
    : null;
  const selectedEmployeeStatus =
    selectedEmployeeWorkload !== null
      ? getWorkloadStatus(selectedEmployeeWorkload)
      : null;

  const isSelectedEmployeeOnLeave = (() => {
    if (!formData.employeeId) return false;
    const emp = employees.find((e) => e._id === formData.employeeId);
    return (
      emp?.onLeave === true ||
      (emp?.status && emp.status.toLowerCase() === "on leave")
    );
  })();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading resource allocations...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Allocation — {project?.name || "Untitled Project"}
          </h1>
          <p className="text-gray-600">
            Manage human, financial, and material resources for this project.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">
                  ₱{totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaDollarSign className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Allocations</p>
                <p className="text-2xl font-bold">{resources.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaUsers className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overloaded Employees</p>
                <p className="text-2xl font-bold">{overloadedEmployees}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FaExclamationTriangle className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add / Edit */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setEditResource(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <FaPlus /> Add Resource
          </button>
        </div>

        {showForm && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {editResource ? "Edit Allocation" : "New Allocation"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setEditResource(null);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Task *</label>
                <select
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.phaseName} → {task.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Employee *</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => {
                    const isOnLeave =
                      emp.onLeave === true ||
                      (emp.status && emp.status.toLowerCase() === "on leave");
                    return (
                      <option
                        key={emp._id}
                        value={emp._id}
                        disabled={isOnLeave}
                        className={isOnLeave ? "text-gray-400 italic" : ""}
                      >
                        {emp.name}
                        {isOnLeave ? " (On Leave)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Equipment</label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="Enter equipment details"
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Budget (₱) *</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Workload / On-leave Alert */}
            {formData.employeeId && (
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  isSelectedEmployeeOnLeave
                    ? "bg-red-50 border-red-200"
                    : selectedEmployeeWorkload >= 80
                    ? "bg-red-50 border-red-200"
                    : selectedEmployeeWorkload >= 60
                    ? "bg-orange-50 border-orange-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle
                    className={
                      isSelectedEmployeeOnLeave
                        ? "text-red-600"
                        : selectedEmployeeWorkload >= 80
                        ? "text-red-600"
                        : selectedEmployeeWorkload >= 60
                        ? "text-orange-600"
                        : "text-blue-600"
                    }
                  />
                  <span
                    className={`text-sm ${
                      isSelectedEmployeeOnLeave
                        ? "text-red-800"
                        : selectedEmployeeWorkload >= 80
                        ? "text-red-800"
                        : selectedEmployeeWorkload >= 60
                        ? "text-orange-800"
                        : "text-blue-800"
                    }`}
                  >
                    {isSelectedEmployeeOnLeave ? (
                      <>
                        Selected employee is currently <b>On Leave</b>. You
                        cannot assign them to a task.
                      </>
                    ) : (
                      <>
                        Selected employee workload:{" "}
                        <b>
                          {selectedEmployeeWorkload}% (
                          {selectedEmployeeStatus?.text})
                        </b>
                        {selectedEmployeeWorkload >= 80 && " — OVERLOADED!"}
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={
                  isSelectedEmployeeOnLeave ||
                  !formData.taskId ||
                  !formData.employeeId ||
                  !formData.budget
                }
                className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                  isSelectedEmployeeOnLeave ||
                  !formData.taskId ||
                  !formData.employeeId ||
                  !formData.budget
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <FaSave /> {editResource ? "Save Changes" : "Save Allocation"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setEditResource(null);
                }}
                className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase → Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No resource allocations found. Click "Add Resource" to
                      create your first allocation.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => {
                    const workloadStatus = getWorkloadStatus(resource.workload);
                    return (
                      <tr
                        key={resource.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {resource.taskName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {resource.phaseName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {resource.employee}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {resource.equipment}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{resource.budget.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workloadStatus.color}`}
                          >
                            {resource.workload}% ({workloadStatus.text})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => startEdit(resource)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit allocation"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete allocation"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
