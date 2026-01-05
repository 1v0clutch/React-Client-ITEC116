import React, { useState, useEffect } from "react";

export default function Departments({ data = {}, setData }) {
  const [departments, setDepartments] = useState([]);
  const employees = data.employees || [];
  const [dept, setDept] = useState({ name: "", head: "" });
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/departments");
      const data = await response.json();
      setDepartments(data);
      setData({ ...data, departments: data });
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const addDepartment = async () => {
    if (!dept.name) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dept),
      });
      const newDept = await response.json();
      setDepartments([...departments, newDept]);
      setData({ ...data, departments: [...departments, newDept] });
      setDept({ name: "", head: "" });
      alert("Department added successfully!");
    } catch (err) {
      console.error("Error adding department:", err);
      alert("Error adding department");
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/departments/${id}`, {
        method: "DELETE",
      });
      const updated = departments.filter((d) => d._id !== id);
      setDepartments(updated);
      setData({ ...data, departments: updated });
      alert("Department deleted successfully!");
    } catch (err) {
      console.error("Error deleting department:", err);
      alert("Error deleting department");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (d) => {
    setEditing(d._id);
    setDept({
      name: d.name,
      head: d.head || "",
    });
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/departments/${editing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dept),
      });
      const updated = await response.json();
      const deptList = departments.map((d) => (d._id === editing ? updated : d));
      setDepartments(deptList);
      setData({ ...data, departments: deptList });
      setEditing(null);
      setDept({ name: "", head: "" });
      alert("Department updated successfully!");
    } catch (err) {
      console.error("Error updating department:", err);
      alert("Error updating department");
    } finally {
      setLoading(false);
    }
  };

  const filtered = departments
    .filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const getEmployeeCount = (deptName) => {
    return employees.filter((emp) => emp.department === deptName).length;
  };

  const getEmployeesForDept = (deptName) => {
    return employees.filter((emp) => emp.department === deptName);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Departments</h2>

      {/* Search & Sort */}
      <div className="flex space-x-2 mb-4">
        <input
          className="border p-2 rounded flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search department..."
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="date">Newest</option>
          <option value="name">A-Z</option>
        </select>
      </div>

      {/* Add / Edit Form */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          className="border p-2 rounded"
          value={dept.name}
          onChange={(e) => setDept({ ...dept, name: e.target.value })}
          placeholder="Department Name"
        />
        <input
          className="border p-2 rounded"
          value={dept.head}
          onChange={(e) => setDept({ ...dept, head: e.target.value })}
          placeholder="Head of Department"
        />
      </div>
      <div className="mb-6">
        {editing ? (
          <button
            onClick={saveEdit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={addDepartment}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Department
          </button>
        )}
      </div>

      {/* Department Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Department Name</th>
              <th className="border px-3 py-2 text-left">Head</th>
              <th className="border px-3 py-2 text-left">Employees</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 font-bold">{d.name}</td>
                  <td className="border px-3 py-2">{d.head || "N/A"}</td>
                  <td className="border px-3 py-2">
                    {getEmployeeCount(d.name)} employees
                  </td>
                  <td className="border px-3 py-2 space-x-2">
                    <button
                      onClick={() => setSelected(d)}
                      className="text-purple-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(d)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDepartment(d._id)}
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
                  colSpan="4"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Department Details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
            <p className="text-gray-700 mb-2">
              Head: {selected.head || "Not assigned"}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Total Employees: {getEmployeeCount(selected.name)}
            </p>

            {/* Employees list */}
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Name</th>
                    <th className="border px-3 py-2 text-left">Designation</th>
                    <th className="border px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getEmployeesForDept(selected.name).length > 0 ? (
                    getEmployeesForDept(selected.name).map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="border px-3 py-2">{emp.name}</td>
                        <td className="border px-3 py-2">{emp.designation}</td>
                        <td className="border px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              emp.status === "Active"
                                ? "bg-green-100 text-green-600"
                                : emp.status === "Inactive"
                                ? "bg-gray-100 text-gray-600"
                                : emp.status === "Resigned"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-3 text-gray-500 italic"
                      >
                        No employees in this department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
