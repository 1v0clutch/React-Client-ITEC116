import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Departments({ data = {}, setData }) {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dept, setDept] = useState({ name: "", head: "" });
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Fetch departments and employees from API
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/departments`);
      if (response.ok) {
        const result = await response.json();
        const departments = result.data || result || [];
        setDepartments(departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees`);
      if (response.ok) {
        const result = await response.json();
        const employees = result.data || result || [];
        setEmployees(employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Add Department
  const addDepartment = async () => {
    if (!dept.name.trim()) {
      alert("Please enter department name");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dept.name,
          head: dept.head,
          description: ""
        }),
      });
      
      if (response.ok) {
        fetchDepartments();
        setDept({ name: "", head: "" });
        setShowForm(false);
        alert("Department added successfully!");
      }
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Error adding department");
    } finally {
      setLoading(false);
    }
  };

  // Delete Department
  const deleteDepartment = async (id) => {
    const deptToDelete = departments.find(d => d._id === id);
    const employeesInDept = employees.filter(emp => emp.department === deptToDelete?.name);
    
    if (employeesInDept.length > 0) {
      alert(`Cannot delete department. ${employeesInDept.length} employees are assigned to this department.`);
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/departments/${id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          fetchDepartments();
          alert("Department deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        alert("Error deleting department");
      } finally {
        setLoading(false);
      }
    }
  };

  // Edit Department
  const startEdit = (d) => {
    setEditing(d._id);
    setDept({
      name: d.name,
      head: d.head || "",
    });
    setShowForm(true);
  };

  const saveEdit = async () => {
    if (!dept.name.trim()) {
      alert("Please enter department name");
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/departments/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dept.name,
          head: dept.head,
          description: ""
        }),
      });
      
      if (response.ok) {
        fetchDepartments();
        setEditing(null);
        setDept({ name: "", head: "" });
        setShowForm(false);
        alert("Department updated successfully!");
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Error updating department");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setDept({ name: "", head: "" });
    setShowForm(false);
  };

  // Filter & Sort
  const filtered = departments
    .filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "employees") {
        const aCount = getEmployeeCount(a.name);
        const bCount = getEmployeeCount(b.name);
        return bCount - aCount;
      }
      return b.id - a.id;
    });

  const getEmployeeCount = (deptName) => {
    return employees.filter((emp) => emp.department === deptName).length;
  };

  const getDepartmentEmployees = (deptName) => {
    return employees.filter((emp) => emp.department === deptName);
  };

  const showDepartmentEmployees = (dept) => {
    setSelected(dept);
    setShowEmployeeModal(true);
  };

  // Get available employees for department head selection
  const getAvailableHeads = () => {
    return employees.filter(emp => emp.status === "Active");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-1">Organize your workforce by departments</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditing(null);
              setDept({ name: "", head: "" });
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Department
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Departments</dt>
                  <dd className="text-lg font-medium text-gray-900">{departments.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd className="text-lg font-medium text-gray-900">{employees.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg per Department</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {departments.length > 0 ? Math.round(employees.length / departments.length) : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Departments</label>
              <input
                type="text"
                placeholder="Search by department name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Department Name</option>
                <option value="employees">Employee Count</option>
                <option value="date">Date Created</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setSearch("")}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>

        {/* Department List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Departments ({filtered.length})
            </h2>
          </div>
          
          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {departments.length === 0 ? "Get started by creating your first department." : "Try adjusting your search criteria."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((department) => (
                  <div key={department._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{department.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Head: {department.head || "Not assigned"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {getEmployeeCount(department.name)} employees
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => startEdit(department)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDepartment(department._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => showDepartmentEmployees(department)}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Employees ({getEmployeeCount(department.name)})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editing ? "Edit Department" : "Add New Department"}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name *</label>
                  <input
                    type="text"
                    value={dept.name}
                    onChange={(e) => setDept({ ...dept, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
                  <input
                    type="text"
                    value={dept.head}
                    onChange={(e) => setDept({ ...dept, head: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter department head name"
                  />
                  <p className="mt-1 text-xs text-gray-500">You can type the name directly or select from available employees below</p>
                  {getAvailableHeads().length > 0 && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Or select from employees:</label>
                      <select
                        value=""
                        onChange={(e) => setDept({ ...dept, head: e.target.value })}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select from employees...</option>
                        {getAvailableHeads().map((emp) => (
                          <option key={emp._id} value={emp.name}>
                            {emp.name} ({emp.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editing ? saveEdit : addDepartment}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editing ? "Update Department" : "Add Department"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee List Modal */}
      {showEmployeeModal && selected && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Employees in {selected.name} Department
                </h3>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {getDepartmentEmployees(selected.name).length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No employees in this department</h3>
                    <p className="mt-1 text-sm text-gray-500">Employees will appear here when assigned to this department.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employment Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getDepartmentEmployees(selected.name).map((employee) => (
                          <tr key={employee._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {employee.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                  <div className="text-sm text-gray-500">{employee.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {employee.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Full Time
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}