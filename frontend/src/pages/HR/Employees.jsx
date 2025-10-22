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

  // 🧮 Generate Employee ID (EMP-001, EMP-002, etc.)
  const generateEmployeeID = () => {
    const nextNum = employees.length + 1;
    return `EMP-${nextNum.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    if (!emp.empId) {
      setEmp((prev) => ({ ...prev, empId: generateEmployeeID() }));
    }
  }, [employees]);

  const addEmployee = () => {
    if (!emp.name || !emp.designation || !emp.department || !emp.employmentType || !emp.hireDate) {
      alert("Please fill in all fields.");
      return;
    }

    const newEmp = { id: Date.now(), ...emp };

    setData({ ...data, employees: [...employees, newEmp] });

    setEmp({
      id: "",
      empId: generateEmployeeID(),
      name: "",
      designation: "",
      department: "",
      employmentType: "",
      hireDate: "",
      status: "Active",
    });
  };

  const deleteEmployee = (id) => {
    setData({
      ...data,
      employees: employees.filter((e) => e.id !== id),
    });
  };

  const editEmployee = (id) => {
    const toEdit = employees.find((e) => e.id === id);
    if (toEdit) {
      setEmp(toEdit);
      setData({
        ...data,
        employees: employees.filter((e) => e.id !== id),
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Employees</h2>

      {/* Add / Edit Employee Form */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          value={emp.empId}
          readOnly
          placeholder="Employee ID (auto)"
        />
        <input
          className="border p-2 rounded"
          value={emp.name}
          onChange={(e) => setEmp({ ...emp, name: e.target.value })}
          placeholder="Employee Name"
        />
        <input
          className="border p-2 rounded"
          value={emp.designation}
          onChange={(e) => setEmp({ ...emp, designation: e.target.value })}
          placeholder="Designation"
        />

        {/* Department Dropdown */}
        <select
          className="border p-2 rounded"
          value={emp.department}
          onChange={(e) => setEmp({ ...emp, department: e.target.value })}
        >
          <option value="">Select Department</option>
          {departments.length > 0 ? (
            departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))
          ) : (
            <option disabled>No departments available</option>
          )}
        </select>

        {/* Employment Type */}
        <select
          className="border p-2 rounded"
          value={emp.employmentType}
          onChange={(e) => setEmp({ ...emp, employmentType: e.target.value })}
        >
          <option value="">Select Employment Type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">On Contract</option>
        </select>

        {/* Hire Date */}
        <input
          type="date"
          className="border p-2 rounded"
          value={emp.hireDate}
          onChange={(e) => setEmp({ ...emp, hireDate: e.target.value })}
        />

        {/* Status */}
        <select
          className="border p-2 rounded"
          value={emp.status}
          onChange={(e) => setEmp({ ...emp, status: e.target.value })}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Terminated">Terminated</option>
          <option value="Resigned">Resigned</option>
        </select>
      </div>

      <button
        onClick={addEmployee}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {emp.id ? "Update Employee" : "Add Employee"}
      </button>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Employee ID</th>
              <th className="border px-3 py-2 text-left">Employee Name</th>
              <th className="border px-3 py-2 text-left">Designation</th>
              <th className="border px-3 py-2 text-left">Department</th>
              <th className="border px-3 py-2 text-left">Employment Type</th>
              <th className="border px-3 py-2 text-left">Hire Date</th>
              <th className="border px-3 py-2 text-left">Status</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 font-mono">{e.empId}</td>
                  <td className="border px-3 py-2">{e.name}</td>
                  <td className="border px-3 py-2">{e.designation}</td>
                  <td className="border px-3 py-2">{e.department}</td>
                  <td className="border px-3 py-2">{e.employmentType}</td>
                  <td className="border px-3 py-2">{e.hireDate}</td>
                  <td className="border px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        e.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : e.status === "Inactive"
                          ? "bg-gray-100 text-gray-600"
                          : e.status === "Resigned"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="border px-3 py-2">
                    <button
                      onClick={() => editEmployee(e.id)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEmployee(e.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
