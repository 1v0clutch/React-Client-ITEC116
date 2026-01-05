import React, { useState, useEffect } from "react";

export default function Employees({ data = {}, setData }) {
  const employees = data.employees || [];
  const departments = data.departments || [];

  const [emp, setEmp] = useState({
    id: "",
    empId: "",
    name: "",
    designation: "",
    department: "",
    employmentType: "",
    hireDate: "",
    status: "Active",
  });

  // 🧮 Generate next Employee ID — fills deleted gaps
  const generateEmployeeID = () => {
    const existingNums = employees
      .map((e) => parseInt(e.empId?.split("-")[1]))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    let nextNum = 1;
    for (let num of existingNums) {
      if (num !== nextNum) break; // find missing number
      nextNum++;
    }

    return `EMP-${nextNum.toString().padStart(3, "0")}`;
  };

  // Generate only when adding a new employee
  useEffect(() => {
    if (!emp.id && !emp.empId) {
      setEmp((prev) => ({
        ...prev,
        empId: generateEmployeeID(),
      }));
    }
  }, [employees]);

  // ➕ Add or 🛠 Update Employee
  const addEmployee = () => {
    if (
      !emp.name ||
      !emp.designation ||
      !emp.department ||
      !emp.employmentType ||
      !emp.hireDate
    ) {
      alert("Please fill in all fields.");
      return;
    }

    let updatedEmployees;

    if (emp.id) {
      // Update existing employee (keep empId)
      updatedEmployees = employees.map((e) =>
        e.id === emp.id ? { ...emp, empId: e.empId } : e
      );
    } else {
      // Add new employee (unique ID, fills gap)
      const newEmp = { ...emp, id: Date.now(), empId: generateEmployeeID() };
      updatedEmployees = [...employees, newEmp];
    }

    setData({ ...data, employees: updatedEmployees });

    // Reset form
    setEmp({
      id: "",
      empId: "",
      name: "",
      designation: "",
      department: "",
      employmentType: "",
      hireDate: "",
      status: "Active",
    });
  };

  // 🗑 Delete specific employee
  const deleteEmployee = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    const updatedEmployees = employees.filter((e) => e.id !== id);
    setData({ ...data, employees: updatedEmployees });
  };

  // ✏️ Load data to edit
  const editEmployee = (id) => {
    const toEdit = employees.find((e) => e.id === id);
    if (toEdit) {
      setEmp({ ...toEdit });
    }
  };

  // ❌ Cancel editing
  const cancelEdit = () => {
    setEmp({
      id: "",
      empId: "",
      name: "",
      designation: "",
      department: "",
      employmentType: "",
      hireDate: "",
      status: "Active",
    });
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
          <h3 className="text-xl font-bold text-gray-800">{emp.id ? "Edit Employee" : "Add New Employee"}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Employee ID
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
              value={emp.empId || generateEmployeeID()}
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
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.name}
              onChange={(e) => setEmp({ ...emp, name: e.target.value })}
              placeholder="Enter employee name"
            />
          </div>

          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              Designation
            </label>
            <input
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 group-hover:border-teal-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.designation}
              onChange={(e) => setEmp({ ...emp, designation: e.target.value })}
              placeholder="Enter designation"
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
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.department}
              onChange={(e) => setEmp({ ...emp, department: e.target.value })}
            >
              <option key="select-dept" value="">Select Department</option>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))
              ) : (
                <option key="no-dept" disabled>No departments available</option>
              )}
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
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.employmentType}
              onChange={(e) => setEmp({ ...emp, employmentType: e.target.value })}
            >
              <option key="select-employment" value="">Select Employment Type</option>
              <option key="full-time" value="Full Time">Full Time</option>
              <option key="part-time" value="Part Time">Part Time</option>
              <option key="contract" value="Contract">On Contract</option>
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
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.hireDate}
              onChange={(e) => setEmp({ ...emp, hireDate: e.target.value })}
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
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 group-hover:border-yellow-300 transition-all duration-200 bg-gray-50 focus:bg-white"
              value={emp.status}
              onChange={(e) => setEmp({ ...emp, status: e.target.value })}
            >
              <option key="active" value="Active">Active</option>
              <option key="inactive" value="Inactive">Inactive</option>
              <option key="terminated" value="Terminated">Terminated</option>
              <option key="resigned" value="Resigned">Resigned</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={addEmployee}
            className={`${
              emp.id 
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            } text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={emp.id ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
            {emp.id ? "Save Update" : "Add Employee"}
          </button>

          {emp.id && (
            <button
              onClick={cancelEdit}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
        </div>
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
          {employees.length === 0 ? (
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
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Designation</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Employment Type</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Hire Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, index) => (
                    <tr key={e.id || e.empId || `emp-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold font-mono">
                          {e.empId}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-800">{e.name}</td>
                      <td className="py-4 px-4 text-gray-600">{e.designation}</td>
                      <td className="py-4 px-4 text-gray-600">{e.department}</td>
                      <td className="py-4 px-4 text-gray-600">{e.employmentType}</td>
                      <td className="py-4 px-4 text-gray-600">{e.hireDate}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            e.status === "Active"
                              ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                              : e.status === "Inactive"
                              ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                              : e.status === "Resigned"
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                              : "bg-gradient-to-r from-red-400 to-red-600 text-white"
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editEmployee(e.id)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEmployee(e.id)}
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
