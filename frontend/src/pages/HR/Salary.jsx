import React, { useState } from "react";

export default function Salary() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    employee: "",
    role: "",
    joinDate: "",
    base: "",
    allowance: "",
    deduction: "",
    bonus: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Save or Update
  const saveRecord = () => {
    if (!form.employee || !form.base) return;

    if (editId) {
      setRecords(
        records.map((r) => (r.id === editId ? { ...r, ...form } : r))
      );
      setEditId(null);
    } else {
      setRecords([...records, { ...form, id: Date.now() }]);
    }

    setForm({
      employee: "",
      role: "",
      joinDate: "",
      base: "",
      allowance: "",
      deduction: "",
      bonus: "",
    });
  };

  // Delete
  const deleteRecord = (id) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // Edit
  const editRecord = (rec) => {
    setForm(rec);
    setEditId(rec.id);
  };

  // Print Payslip (per employee)
  const printPayslip = (rec) => {
    const gross =
      Number(rec.base || 0) +
      Number(rec.allowance || 0) +
      Number(rec.bonus || 0);

    const net = gross - Number(rec.deduction || 0);

    const w = window.open("", "_blank");
    w.document.write(`
      <html>
        <head>
          <title>Payslip - ${rec.employee}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .slip { max-width: 450px; margin: auto; border: 1px solid #000; padding: 20px; border-radius: 8px; }
            h2, h3 { text-align: center; margin: 5px 0; }
            .row { margin: 6px 0; display: flex; justify-content: space-between; }
            .label { font-weight: bold; }
            hr { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="slip">
            <h2>Payslip</h2>
            <h3>${new Date().toLocaleDateString()}</h3>
            <hr/>
            <div class="row"><span class="label">Employee:</span> ${rec.employee}</div>
            <div class="row"><span class="label">Role:</span> ${rec.role}</div>
            <div class="row"><span class="label">Join Date:</span> ${rec.joinDate}</div>
            <hr/>
            <h3>Earnings</h3>
            <div class="row"><span>Base Salary:</span> ₱${rec.base || 0}</div>
            <div class="row"><span>Allowance:</span> ₱${rec.allowance || 0}</div>
            <div class="row"><span>Bonus:</span> ₱${rec.bonus || 0}</div>
            <hr/>
            <h3>Deductions</h3>
            <div class="row"><span>Deduction:</span> ₱${rec.deduction || 0}</div>
            <hr/>
            <div class="row"><span class="label">Gross Salary:</span> ₱${gross}</div>
            <div class="row"><span class="label">Net Salary:</span> ₱${net}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = window.close; }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  // Print Full Payroll Report (all employees)
  const printPayrollReport = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html>
        <head>
          <title>Payroll Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Payroll Report - ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Join Date</th>
                <th>Base</th>
                <th>Allowance</th>
                <th>Bonus</th>
                <th>Deduction</th>
                <th>Net Salary</th>
              </tr>
            </thead>
            <tbody>
              ${records
                .map((r) => {
                  const gross =
                    Number(r.base || 0) +
                    Number(r.allowance || 0) +
                    Number(r.bonus || 0);
                  const net = gross - Number(r.deduction || 0);

                  return `
                    <tr>
                      <td>${r.employee}</td>
                      <td>${r.role}</td>
                      <td>${r.joinDate}</td>
                      <td>₱${r.base || 0}</td>
                      <td>₱${r.allowance || 0}</td>
                      <td>₱${r.bonus || 0}</td>
                      <td>₱${r.deduction || 0}</td>
                      <td>₱${net}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.onafterprint = window.close; }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  // Filter
  const filtered = records.filter((r) =>
    r.employee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Salary Management</h1>

      {/* Form Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="Employee Name"
          value={form.employee}
          onChange={(e) => setForm({ ...form, employee: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded"
          placeholder="Join Date"
          value={form.joinDate}
          onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Base Salary"
          value={form.base}
          onChange={(e) => setForm({ ...form, base: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Allowance"
          value={form.allowance}
          onChange={(e) => setForm({ ...form, allowance: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Bonus"
          value={form.bonus}
          onChange={(e) => setForm({ ...form, bonus: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Deduction"
          value={form.deduction}
          onChange={(e) => setForm({ ...form, deduction: e.target.value })}
        />
        <button
          onClick={saveRecord}
          className="bg-blue-600 text-white rounded p-2"
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* Search */}
      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Search employee..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Print Payroll Button */}
      <div className="mb-4">
        <button
          onClick={printPayrollReport}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Print Payroll Report
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Employee</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Join Date</th>
              <th className="border p-2">Base</th>
              <th className="border p-2">Allowance</th>
              <th className="border p-2">Bonus</th>
              <th className="border p-2">Deduction</th>
              <th className="border p-2">Net Salary</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const gross =
                Number(r.base || 0) +
                Number(r.allowance || 0) +
                Number(r.bonus || 0);
              const net = gross - Number(r.deduction || 0);

              return (
                <tr key={r.id} className="text-center">
                  <td className="border p-2">{r.employee}</td>
                  <td className="border p-2">{r.role}</td>
                  <td className="border p-2">{r.joinDate}</td>
                  <td className="border p-2">₱{r.base}</td>
                  <td className="border p-2">₱{r.allowance || 0}</td>
                  <td className="border p-2">₱{r.bonus || 0}</td>
                  <td className="border p-2">₱{r.deduction || 0}</td>
                  <td className="border p-2">₱{net}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded"
                      onClick={() => editRecord(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => deleteRecord(r.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-indigo-600 text-white px-2 py-1 rounded"
                      onClick={() => printPayslip(r)}
                    >
                      Payslip
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="9" className="p-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
