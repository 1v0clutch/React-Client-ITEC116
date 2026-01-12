import React, { useState, useEffect } from "react";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    position: "",
    department: "",
    employmentType: "Full Time",
    hireDate: "",
    status: "Active",
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const DEPARTMENTS = ["HR", "Finance", "IT", "Marketing", "Sales"];
  const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract"];
  const STATUS_OPTIONS = ["Active", "Inactive", "On Leave"];

  // Fetch employees to auto-generate employeeId
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/employee");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        if (!editing) {
          generateEmployeeId(data);
        }
      } else {
        console.error("Failed to fetch employees");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate next Employee ID
  const generateEmployeeId = (existingEmployees) => {
    if (!existingEmployees || existingEmployees.length === 0) {
      setFormData((prev) => ({ ...prev, employeeId: "EMP-001" }));
      return;
    }
    const ids = existingEmployees
      .map((emp) => parseInt(emp.employeeId.replace("EMP-", ""), 10))
      .filter(id => !isNaN(id));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = (maxId + 1).toString().padStart(3, "0");
    setFormData((prev) => ({ ...prev, employeeId: "EMP-" + nextId }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editing 
        ? `http://localhost:8000/api/employee/${editing}`
        : "http://localhost:8000/api/employee";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(
          `Failed to ${editing ? 'update' : 'add'} employee: ` + (errData.message || "Unknown error")
        );
        return;
      }

      const data = await response.json();
      alert(`✅ Employee ${editing ? 'updated' : 'added'} successfully: ` + data.name);

      // Reset form and refresh data
      resetForm();
      await fetchEmployees();
    } catch (err) {
      alert(`❌ Error ${editing ? 'updating' : 'adding'} employee: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditing(employee._id);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      employmentType: employee.employmentType,
      hireDate: employee.hireDate,
      status: employee.status,
    });
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/employee/${employeeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Employee deleted successfully");
        await fetchEmployees();
      } else {
        const errData = await response.json();
        alert("Failed to delete employee: " + (errData.message || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Error deleting employee: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      employeeId: "",
      name: "",
      position: "",
      department: "",
      employmentType: "Full Time",
      hireDate: "",
      status: "Active",
    });
    generateEmployeeId(employees);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Employee Management</h2>
            <p className="text-white/80 text-sm">Manage employee records and information</p>
          </div>
        </div>
      </div>

      {/* Enhanced Add/Edit Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{editing ? "Edit Employee" : "Add New Employee"}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                readOnly
              />
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Employee Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter employee name"
                required
              />
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 group-hover:border-teal-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter position"
              />
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Hire Date
              </label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editing ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
              )}
              {editing ? "Update Employee" : "Add Employee"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Enhanced Employee Table */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Employee Records</h3>
              <p className="text-white/80 text-sm">{employees.length} employees</p>
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
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No employees found</p>
              <p className="text-gray-400 mt-2">Add your first employee above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Position</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Employment Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Hire Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={employee._id || `emp-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold font-mono">
                          {employee.employeeId}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{employee.name}</td>
                      <td className="py-4 px-4 text-gray-600">{employee.position}</td>
                      <td className="py-4 px-4 text-gray-600">{employee.department}</td>
                      <td className="py-4 px-4 text-gray-600">{employee.employmentType}</td>
                      <td className="py-4 px-4 text-gray-600">{employee.hireDate}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            employee.status === "Active"
                              ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                              : employee.status === "Inactive"
                              ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                              : employee.status === "On Leave"
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(employee._id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Delete
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
    </div>
  );
}
