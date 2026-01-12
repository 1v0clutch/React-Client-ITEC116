import { useState, useEffect } from "react";

export default function Departments({ data = {}, setData }) {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dept, setDept] = useState({ name: "", head: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API Base URL
  const API_BASE = "http://localhost:8000/api";

  // Fetch departments from backend API
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/departments`);
      if (response.ok) {
        const departmentData = await response.json();
        setDepartments(departmentData);
        
        // Also update parent data for consistency
        if (setData) {
          setData(prevData => ({ 
            ...prevData, 
            departments: departmentData
          }));
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch departments:", errorData.message);
        alert(`Error: ${errorData.message || 'Failed to fetch departments'}`);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Error: Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from backend API
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employee`);
      if (response.ok) {
        const employeeData = await response.json();
        setEmployees(employeeData);
      } else {
        console.error("Failed to fetch employees from backend");
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees(data.employees || []);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Add Department
  const addDepartment = async () => {
    if (!dept.name.trim()) {
      alert("Please enter a department name.");
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dept.name.trim(),
          head: dept.head.trim(),
          description: dept.description.trim()
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh departments list
        await fetchDepartments();
        
        // Reset form
        setDept({ name: "", head: "", description: "" });
        alert("Department added successfully!");
      } else {
        alert(`Error: ${responseData.message || 'Failed to add department'}`);
      }
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Error: Unable to connect to server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Department
  const deleteDepartment = async (departmentId) => {
    if (!departmentId) {
      alert("Error: Invalid department ID.");
      return;
    }
    
    const deptToDelete = departments.find(d => d._id === departmentId);
    if (!deptToDelete) {
      alert("Error: Department not found.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${deptToDelete.name}" department?`)) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/departments/${departmentId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh departments list
        await fetchDepartments();
        alert(`Department "${deptToDelete.name}" deleted successfully!`);
      } else {
        alert(`Error: ${responseData.message || 'Failed to delete department'}`);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Error: Unable to connect to server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Department
  const startEdit = (d) => {
    if (!d || !d._id) {
      alert("Error: Invalid department data.");
      return;
    }
    
    setEditing(d._id);
    setDept({
      name: d.name || "",
      head: d.head || "",
      description: d.description || "",
    });
  };

  const saveEdit = async () => {
    if (!dept.name.trim()) {
      alert("Please enter a department name.");
      return;
    }
    
    if (!editing) {
      alert("Error: No department selected for editing.");
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/departments/${editing}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dept.name.trim(),
          head: dept.head.trim(),
          description: dept.description.trim()
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh departments list
        await fetchDepartments();
        
        // Reset editing state
        setEditing(null);
        setDept({ name: "", head: "", description: "" });
        alert("Department updated successfully!");
      } else {
        alert(`Error: ${responseData.message || 'Failed to update department'}`);
      }
    } catch (error) {
      console.error("Error updating department:", error);
      alert("Error: Unable to connect to server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setDept({ name: "", head: "", description: "" });
  };

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchDepartments(), fetchEmployees()]);
  };

  // Filter & Sort
  const filtered = departments
    .filter((d) =>
      d && d.name && d.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // Sort by creation date (newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Fallback to string comparison for IDs
      const aId = a._id || "";
      const bId = b._id || "";
      return bId.localeCompare(aId);
    });

  const getEmployeeCount = (deptName) => {
    if (!deptName || !Array.isArray(employees)) return 0;
    
    return employees.filter((emp) => {
      if (!emp) return false;
      const empDept = emp.department || emp.dept;
      return empDept === deptName;
    }).length;
  };

  const getEmployeesForDept = (deptName) => {
    if (!deptName || !Array.isArray(employees)) return [];
    
    return employees.filter((emp) => {
      if (!emp) return false;
      const empDept = emp.department || emp.dept;
      return empDept === deptName;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Department Management</h2>
            <p className="text-white/80 text-sm">Organize and manage company departments</p>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Filter Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">Search & Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Departments
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department name..."
            />
          </div>
          
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 group-hover:border-cyan-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option key="date" value="date">Newest First</option>
              <option key="name" value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Add/Edit Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800">
              {editing ? `Edit Department: ${departments.find(d => d._id === editing)?.name || 'Unknown'}` : "Add New Department"}
            </h3>
            {submitting && (
              <p className="text-blue-600 text-sm mt-1 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {editing ? 'Updating...' : 'Adding...'}
              </p>
            )}
          </div>
          <button
            onClick={refreshData}
            disabled={loading || submitting}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Department Name *
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={dept.name}
              onChange={(e) => setDept({ ...dept, name: e.target.value })}
              placeholder="Enter department name"
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Department Head
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 group-hover:border-emerald-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={dept.head}
              onChange={(e) => setDept({ ...dept, head: e.target.value })}
              placeholder="Enter department head name"
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Description
            </label>
            <textarea
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
              value={dept.description}
              onChange={(e) => setDept({ ...dept, description: e.target.value })}
              placeholder="Enter department description (optional)"
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {editing ? (
            <>
              <button
                onClick={saveEdit}
                disabled={submitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                {submitting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={submitting}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addDepartment}
              disabled={submitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              {submitting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              {submitting ? 'Adding...' : 'Add Department'}
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Department Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Department Directory</h3>
              <p className="text-white/80 text-sm">{filtered.length} departments</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-gray-500">Loading employees...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No departments found</p>
              <p className="text-gray-400 mt-2">Add your first department above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department Head</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee Count</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, index) => (
                    <tr key={d._id || `dept-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4 font-medium text-gray-800">{d.name}</td>
                      <td className="py-4 px-4 text-gray-600">{d.head || "Not assigned"}</td>
                      <td className="py-4 px-4 text-gray-600 max-w-xs">
                        <div className="truncate" title={d.description}>
                          {d.description || "No description"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {getEmployeeCount(d.name)} employees
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            key={`view-${d._id}`}
                            onClick={() => setSelected(d)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            View
                          </button>
                          <button
                            key={`edit-${d._id}`}
                            onClick={() => startEdit(d)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            key={`delete-${d._id}`}
                            onClick={() => deleteDepartment(d._id)}
                            disabled={submitting}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            {submitting ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal for Department Details */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
                    <p className="text-white/80 text-sm">Department Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Department Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Department Head</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{selected.head || "Not assigned"}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Total Employees</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{getEmployeeCount(selected.name)} employees</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Created</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selected.description && (
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg font-semibold text-gray-700">Description</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{selected.description}</p>
                </div>
              )}

              {/* Employees Table */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Department Employees
                </h4>
                
                {getEmployeesForDept(selected.name).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Designation</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getEmployeesForDept(selected.name).map((emp, index) => (
                          <tr key={emp._id || emp.id || `modal-emp-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                            <td className="py-3 px-4 font-medium text-gray-800">{emp.name}</td>
                            <td className="py-3 px-4 text-gray-600">{emp.position || emp.designation || 'N/A'}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  emp.status === "Active"
                                    ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                                    : emp.status === "Inactive"
                                    ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                                    : emp.status === "Resigned"
                                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                                    : emp.status === "On Leave"
                                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                                    : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                                }`}
                              >
                                {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No employees in this department</p>
                    <p className="text-gray-400 text-sm mt-1">Employees will appear here when assigned to this department</p>
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
