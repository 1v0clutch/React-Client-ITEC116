import React, { useState } from "react";

export default function Payroll({ data, setData }) {
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState({ from: "", to: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ base: 0, ot: 0, adj: 0, deductions: {} }); // 📌 may deductions na

  const generatePayroll = () => {
    if (!period.from || !period.to) return alert("Select payroll period first");

    const newRecords = data.employees
      .filter((emp) => emp.status !== "Terminated" && emp.status !== "Resigned")
      .map((emp) => ({
        id: emp.id,
        name: emp.name,
        dept: emp.department,
        base: emp.base || 0,
        ot: emp.ot || 0,
        adj: emp.adj || 0,
        deductions: emp.deductions || {
          sss: 500,
          philhealth: 300,
          pagibig: 200,
          tax: 1000,
        },
      }));

    setRecords(newRecords);
  };

  const computeNetPay = (r) => {
    const totalDed = Object.values(r.deductions).reduce((a, b) => a + b, 0);
    return r.base + r.ot + r.adj - totalDed;
  };

  const openPayslip = (rec) => {
    const netPay = computeNetPay(rec);
    const newWin = window.open("", "_blank", "width=600,height=700");
    newWin.document.write(`
      <html>
      <head>
        <title>Payslip - ${rec.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding:20px; background:#f9f9f9; }
          .card { border:1px solid #ddd; padding:20px; border-radius:10px; width:100%; max-width:500px; margin:auto; background:#fff; }
          h2, h3 { text-align:center; margin:5px 0; }
          .row { display:flex; justify-content:space-between; margin:5px 0; }
          .label { font-weight:bold; }
          .btn { display:block; margin:20px auto 0 auto; padding:8px 16px; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; }
          .btn:hover { background:#1d4ed8; }
          hr { margin:10px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Company Name</h2>
          <h3>Payslip</h3>
          <p style="text-align:center;">Period: ${period.from} to ${period.to}</p>
          <hr/>
          <div class="row"><span class="label">Name:</span><span>${rec.name}</span></div>
          <div class="row"><span class="label">Department:</span><span>${rec.dept}</span></div>
          <hr/>
          <div class="row"><span class="label">Base Salary:</span><span>₱${rec.base}</span></div>
          <div class="row"><span class="label">Overtime:</span><span>₱${rec.ot}</span></div>
          <div class="row"><span class="label">Adjustment:</span><span>₱${rec.adj}</span></div>
          <hr/>
          <div class="row"><span class="label">SSS:</span><span>₱${rec.deductions.sss}</span></div>
          <div class="row"><span class="label">PhilHealth:</span><span>₱${rec.deductions.philhealth}</span></div>
          <div class="row"><span class="label">Pag-IBIG:</span><span>₱${rec.deductions.pagibig}</span></div>
          <div class="row"><span class="label">Tax:</span><span>₱${rec.deductions.tax}</span></div>
          <hr/>
          <div class="row"><span class="label">Net Pay:</span><span>₱${netPay}</span></div>
          <button class="btn" onclick="window.print()">Print Payslip</button>
        </div>
      </body>
      </html>
    `);
    newWin.document.close();
  };

  const startEdit = (rec) => {
    setEditing(rec.id);
    setEditForm({ base: rec.base, ot: rec.ot, adj: rec.adj, deductions: { ...rec.deductions } }); // 📌 kasama deductions
  };

  const saveEdit = () => {
    setRecords(
      records.map((r) =>
        r.id === editing ? { ...r, ...editForm } : r
      )
    );
    setEditing(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll</h1>

      {/* Payroll Period */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Payroll Period</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={period.from}
            onChange={(e) => setPeriod({ ...period, from: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={period.to}
            onChange={(e) => setPeriod({ ...period, to: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            onClick={generatePayroll}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Payroll Records */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Payroll Records</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Employee</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Base</th>
              <th className="border p-2">OT</th>
              <th className="border p-2">Adj</th>
              <th className="border p-2">Deductions</th>
              <th className="border p-2">Net Pay</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2">{r.dept}</td>
                <td className="border p-2">₱{r.base}</td>
                <td className="border p-2">₱{r.ot}</td>
                <td className="border p-2">₱{r.adj}</td>
                <td className="border p-2">
                  ₱{Object.values(r.deductions).reduce((a, b) => a + b, 0)}
                </td>
                <td className="border p-2">₱{computeNetPay(r)}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => openPayslip(r)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    View Payslip
                  </button>
                  <button
                    onClick={() => startEdit(r)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold mb-2">Edit Payroll</h3>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div>
                <label className="block text-sm font-medium mb-1">Base Salary</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editForm.base}
                  onChange={(e) =>
                    setEditForm({ ...editForm, base: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Overtime</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editForm.ot}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ot: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adjustment</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editForm.adj}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adj: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* 📌 Editable deductions */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              {Object.keys(editForm.deductions).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={editForm.deductions[key]}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        deductions: {
                          ...editForm.deductions,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
