import React, { useState } from "react";

export default function Salary({ data = {} }) {
  const employees = data.employees || [];
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [salaryList, setSalaryList] = useState([]);

  const [salary, setSalary] = useState({
    empId: "",
    name: "",
    department: "",
    baseSalary: "",
    bonus: "",
    deductions: "",
    totalSalary: "",
  });

  // 🔍 Search employee by Employee ID
  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const result = employees.filter((e) =>
      e.empId.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredEmployees(result);

    if (result.length === 1) {
      const emp = result[0];
      setSalary({
        ...salary,
        empId: emp.empId,
        name: emp.name,
        department: emp.department,
      });
    }
  };

  const calculateTotal = () => {
    const base = parseFloat(salary.baseSalary) || 0;
    const bonus = parseFloat(salary.bonus) || 0;
    const deduct = parseFloat(salary.deductions) || 0;
    return base + bonus - deduct;
  };

  const addSalaryRecord = () => {
    if (!salary.empId || !salary.baseSalary) {
      alert("Please complete required fields!");
      return;
    }

    const total = calculateTotal();

    const newRecord = {
      ...salary,
      totalSalary: total,
      id: Date.now(),
    };

    setSalaryList([...salaryList, newRecord]);

    // Reset form
    setSalary({
      empId: "",
      name: "",
      department: "",
      baseSalary: "",
      bonus: "",
      deductions: "",
      totalSalary: "",
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Employee Salary</h2>

      {/* Search Bar */}
      <div className="flex mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Employee ID (e.g. EMP-001)"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Salary Form */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          value={salary.empId}
          readOnly
          placeholder="Employee ID"
        />
        <input
          className="border p-2 rounded"
          value={salary.name}
          readOnly
          placeholder="Employee Name"
        />
        <input
          className="border p-2 rounded"
          value={salary.department}
          readOnly
          placeholder="Department"
        />
        <input
          type="number"
          className="border p-2 rounded"
          value={salary.baseSalary}
          onChange={(e) => setSalary({ ...salary, baseSalary: e.target.value })}
          placeholder="Base Salary"
        />
        <input
          type="number"
          className="border p-2 rounded"
          value={salary.bonus}
          onChange={(e) => setSalary({ ...salary, bonus: e.target.value })}
          placeholder="Bonus"
        />
        <input
          type="number"
          className="border p-2 rounded"
          value={salary.deductions}
          onChange={(e) =>
            setSalary({ ...salary, deductions: e.target.value })
          }
          placeholder="Deductions"
        />
      </div>

      <button
        onClick={addSalaryRecord}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Salary Record
      </button>

      {/* Salary Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Employee ID</th>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Department</th>
              <th className="border px-3 py-2 text-left">Base Salary</th>
              <th className="border px-3 py-2 text-left">Bonus</th>
              <th className="border px-3 py-2 text-left">Deductions</th>
              <th className="border px-3 py-2 text-left">Total Salary</th>
            </tr>
          </thead>
          <tbody>
            {salaryList.length > 0 ? (
              salaryList.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{s.empId}</td>
                  <td className="border px-3 py-2">{s.name}</td>
                  <td className="border px-3 py-2">{s.department}</td>
                  <td className="border px-3 py-2">{s.baseSalary}</td>
                  <td className="border px-3 py-2">{s.bonus}</td>
                  <td className="border px-3 py-2">{s.deductions}</td>
                  <td className="border px-3 py-2 font-semibold">
                    ₱{s.totalSalary.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-4 text-gray-500 italic"
                >
                  No salary records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
