import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaDollarSign,
  FaPlus,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

const API_PROJECT = "http://localhost:8000/api/project";
const API_EMPLOYEE = "http://localhost:8000/api/employee";

export default function ResourceAllocationUI() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    taskId: "",
    employeeId: "",
    equipment: "",
    budget: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectResources(selectedProject);
    }
  }, [selectedProject]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectsRes, employeesRes] = await Promise.all([
        fetch(`${API_PROJECT}/projects`), // Fixed: added /projects
        fetch(API_EMPLOYEE),
      ]);

      if (!projectsRes.ok) throw new Error("Failed to fetch projects");
      if (!employeesRes.ok) throw new Error("Failed to fetch employees");

      const projectsData = await projectsRes.json();
      const employeesData = await employeesRes.json();

      setProjects(projectsData);
      setEmployees(employeesData);

      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0]._id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectResources = async (projectId) => {
    try {
      console.log("Fetching project data for:", projectId);

      // Get the full project data with phases and tasks
      const projectRes = await fetch(`${API_PROJECT}/projects/${projectId}`);

      if (!projectRes.ok) {
        throw new Error("Failed to fetch project details");
      }

      const projectData = await projectRes.json();
      console.log("Project data:", projectData);
      console.log("Project phases:", projectData.phases);

      // Now get the allocations
      const allocationsRes = await fetch(
        `${API_PROJECT}/projects/${projectId}/allocations`
      );

      if (!allocationsRes.ok) {
        throw new Error("Failed to fetch allocations");
      }

      const allocationsData = await allocationsRes.json();
      console.log("Allocations data:", allocationsData);

      // Process the resources
      if (allocationsData.resourceAllocations) {
        const resourcesWithDetails = allocationsData.resourceAllocations.map(
          (alloc) => {
            console.log("Processing allocation:", alloc);
            console.log("Looking for task ID:", alloc.task);

            const employee = employees.find(
              (emp) => emp._id === alloc.employee?._id || alloc.employee
            );

            // Find task in project data
            let taskName = "Unknown Task";
            let phaseName = "Unknown Phase";
            let taskFound = false;

            if (projectData.phases && Array.isArray(projectData.phases)) {
              for (const phase of projectData.phases) {
                if (phase.tasks && Array.isArray(phase.tasks)) {
                  const task = phase.tasks.find((t) => {
                    const match = String(t._id) === String(alloc.task);
                    if (match) {
                      console.log(
                        "Found task:",
                        t.name,
                        "in phase:",
                        phase.name
                      );
                    }
                    return match;
                  });
                  if (task) {
                    taskName = task.name;
                    phaseName = phase.name;
                    taskFound = true;
                    break;
                  }
                }
              }
            }

            if (!taskFound) {
              console.log("Task not found for allocation:", alloc);
            }

            return {
              id: alloc._id || `${alloc.employee}-${alloc.task}`,
              taskName: taskName,
              phaseName: phaseName,
              employee: employee ? employee.name : "Unknown Employee",
              employeeId: alloc.employee?._id || alloc.employee,
              taskId: alloc.task,
              equipment: alloc.equipment || "",
              budget: alloc.budget || 0,
              workload: calculateWorkload(
                alloc.employee?._id || alloc.employee
              ),
            };
          }
        );

        console.log("Final resources:", resourcesWithDetails);
        setResources(resourcesWithDetails);
      } else {
        console.log("No resource allocations found");
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching project resources:", error);
      alert("Error loading allocations: " + error.message);
      setResources([]);
    }
  };

  const getAllTasks = (project) => {
    if (!project || !project.phases) return [];
    return project.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        ...task,
        phaseName: phase.name,
      }))
    );
  };

  const calculateWorkload = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (!employee || !employee.allocations) return 0;

    const allocationCount = employee.allocations.length;

    if (allocationCount >= 5) return 100;
    if (allocationCount >= 4) return 80;
    if (allocationCount >= 3) return 60;
    if (allocationCount >= 2) return 40;
    return 20;
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
    if (
      !selectedProject ||
      !formData.taskId ||
      !formData.employeeId ||
      !formData.budget
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        employeeId: formData.employeeId,
        taskId: formData.taskId,
        equipment: formData.equipment,
        budget: parseFloat(formData.budget),
      };

      console.log(
        "Sending allocation to:",
        `${API_PROJECT}/projects/${selectedProject}/allocations`
      );

      // FIXED: Added /projects/ in the URL
      const res = await fetch(
        `${API_PROJECT}/projects/${selectedProject}/allocations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok) {
        // Refresh the resources list
        fetchProjectResources(selectedProject);
        resetForm();
        setShowForm(false);
        alert("Resource allocated successfully!");
      } else {
        alert(`Failed to save allocation: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving allocation:", error);
      alert("Error saving allocation: " + error.message);
    }
  };

  const handleDelete = async (resourceId, employeeId, taskId) => {
    if (!window.confirm("Are you sure you want to delete this allocation?"))
      return;

    try {
      // FIXED: Added /projects/ in the URL
      const res = await fetch(
        `${API_PROJECT}/projects/${selectedProject}/allocations/${resourceId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        // Refresh the list
        fetchProjectResources(selectedProject);
        alert("Allocation deleted successfully!");
      } else {
        const result = await res.json();
        alert(`Failed to delete allocation: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting allocation:", error);
      alert("Error deleting allocation: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      taskId: "",
      employeeId: "",
      equipment: "",
      budget: "",
    });
  };

  const selectedProjectData = projects.find((p) => p._id === selectedProject);
  const tasks = selectedProjectData ? getAllTasks(selectedProjectData) : [];

  const totalBudget = resources.reduce((sum, r) => sum + r.budget, 0);
  const overloadedEmployees = resources.filter((r) => r.workload >= 80).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Allocation Management
          </h1>
          <p className="text-gray-600">
            Manage assignments of human, financial, and material resources
          </p>
        </div>

        {/* Project Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Total Budget Allocated
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaDollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Allocations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resources.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Overloaded Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {overloadedEmployees}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Resource Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FaPlus className="w-4 h-4" />
            Allocate New Resource
          </button>
        </div>

        {/* Allocation Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                New Resource Allocation
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task *
                </label>
                <select
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.phaseName} → {task.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {tasks.length} tasks available
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => {
                    const workload = calculateWorkload(employee._id);
                    const workloadStatus = getWorkloadStatus(workload);
                    return (
                      <option key={employee._id} value={employee._id}>
                        {employee.name} ({workloadStatus.text} - {workload}%)
                      </option>
                    );
                  })}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  {employees.length} employees available
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment/Materials
                </label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter equipment or materials"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Allocated (₱) *
                </label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Workload Warning */}
            {formData.employeeId && (
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  calculateWorkload(formData.employeeId) >= 80
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle
                    className={
                      calculateWorkload(formData.employeeId) >= 80
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  />
                  <span
                    className={`text-sm ${
                      calculateWorkload(formData.employeeId) >= 80
                        ? "text-red-800"
                        : "text-yellow-800"
                    }`}
                  >
                    Selected employee has{" "}
                    {calculateWorkload(formData.employeeId)}% workload
                    {calculateWorkload(formData.employeeId) >= 80 &&
                      " - OVERLOADED!"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Save Allocation
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
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
                      No resource allocations found for this project
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => {
                    const workloadStatus = getWorkloadStatus(resource.workload);
                    return (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {resource.taskName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {resource.employee}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {resource.equipment}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₱{resource.budget.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${workloadStatus.color}`}
                          >
                            {resource.workload}% ({workloadStatus.text})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              handleDelete(
                                resource.id,
                                resource.employeeId,
                                resource.taskId
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
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
