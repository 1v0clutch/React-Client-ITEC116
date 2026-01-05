import React, { useState } from "react";

export default function Payroll({ data }) {
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState({ from: "", to: "" });
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    base: 0,
    ot: 0,
    adj: 0,
    deductions: {},
  });

  // 🧮 Compute Net Pay
  const computeNetPay = (r) => {
    const totalDed = Object.values(r.deductions).reduce((a, b) => a + b, 0);
    return r.base + r.ot + r.adj - totalDed;
  };

  // 🧮 Compute Gross Pay
  const computeGrossPay = (r) => r.base + r.ot + r.adj;

  // 🧾 Generate Payroll
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
    savePayrollToBackend(newRecords);
  };

  // 💾 Save Payroll to Backend
  const savePayrollToBackend = async (recordsToSave = records) => {
    try {
      if (recordsToSave.length === 0)
        return alert("No payroll records to save.");

      await Promise.all(
        recordsToSave.map((r) =>
          fetch("http://localhost:8000/api/hr/payroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: r.id,
              name: r.name,
              department: r.dept,
              payPeriod: `${period.from} - ${period.to}`,
              grossPay: computeGrossPay(r),
              deductions: Object.values(r.deductions).reduce((a, b) => a + b, 0),
              netPay: computeNetPay(r),
            }),
          })
        )
      );

      alert("Payroll records saved successfully!");
    } catch (err) {
      console.error("Error saving payroll:", err);
      alert("Failed to save payroll records.");
    }
  };

  // 🧾 Open EMS Payslip
  const openPayslip = (rec) => {
    const netPay = computeNetPay(rec);
    const grossPay = computeGrossPay(rec);
    const generatedAt = new Date().toLocaleString();

    const newWin = window.open("", "_blank", "width=700,height=800");
    newWin.document.write(`
      <html>
      <head>
        <title>EMS Payslip - ${rec.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 40px;
          }
          .payslip {
            background: white;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h2 {
            text-align: center;
            margin-bottom: 4px;
            font-size: 22px;
          }
          h3 {
            text-align: center;
            margin-top: 0;
            color: #444;
            font-weight: normal;
          }
          hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 15px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
          }
          .label {
            font-weight: bold;
          }
          .section-title {
            margin-top: 20px;
            font-weight: bold;
            color: #333;
          }
          .netpay {
            font-size: 20px;
            font-weight: bold;
            color: #0d6efd;
            text-align: right;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
          .print-btn {
            display: block;
            width: 100%;
            padding: 10px;
            margin-top: 20px;
            background: #0d6efd;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          }
          .print-btn:hover {
            background: #0b5ed7;
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <h2>EMS</h2>
          <h3>Employee Payslip</h3>
          <hr/>
          <div class="row"><span class="label">Employee Name:</span><span>${rec.name}</span></div>
          <div class="row"><span class="label">Department:</span><span>${rec.dept}</span></div>
          <div class="row"><span class="label">Period Covered:</span><span>${period.from} to ${period.to}</span></div>
          <hr/>
          <div class="section-title">Earnings</div>
          <div class="row"><span>Base Pay:</span><span>₱${rec.base.toLocaleString()}</span></div>
          <div class="row"><span>Overtime:</span><span>₱${rec.ot.toLocaleString()}</span></div>
          <div class="row"><span>Adjustment:</span><span>₱${rec.adj.toLocaleString()}</span></div>
          <div class="row"><span class="label">Gross Pay:</span><span>₱${grossPay.toLocaleString()}</span></div>
          <hr/>
          <div class="section-title">Deductions</div>
          <div class="row"><span>SSS:</span><span>₱${rec.deductions.sss}</span></div>
          <div class="row"><span>PhilHealth:</span><span>₱${rec.deductions.philhealth}</span></div>
          <div class="row"><span>Pag-IBIG:</span><span>₱${rec.deductions.pagibig}</span></div>
          <div class="row"><span>Tax:</span><span>₱${rec.deductions.tax}</span></div>
          <hr/>
          <div class="netpay">Net Pay: ₱${netPay.toLocaleString()}</div>
          <hr/>
          <div class="footer">
            Generated by EMS on ${generatedAt}
          </div>
          <button class="print-btn" onclick="window.print()">Print Payslip</button>
        </div>
      </body>
      </html>
    `);
    newWin.document.close();
  };

  // ✏️ Edit Payroll
  const startEdit = (rec) => {
    setEditing(rec.id);
    setEditForm({
      base: rec.base,
      ot: rec.ot,
      adj: rec.adj,
      deductions: { ...rec.deductions },
    });
  };

  const saveEdit = async () => {
    try {
      const updatedRecords = records.map((r) =>
        String(r.id) === String(editing) ? { ...r, ...editForm } : r
      );

      setRecords(updatedRecords);
      const updatedRecord = updatedRecords.find(
        (r) => String(r.id) === String(editing)
      );

      setEditing(null);
      setEditForm({ base: 0, ot: 0, adj: 0, deductions: {} });

      if (updatedRecord) {
        await fetch("http://localhost:8000/api/hr/payroll/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: updatedRecord.id,
            name: updatedRecord.name,
            department: updatedRecord.dept,
            payPeriod: `${period.from} - ${period.to}`,
            base: updatedRecord.base,
            ot: updatedRecord.ot,
            adj: updatedRecord.adj,
            deductions: updatedRecord.deductions,
            netPay: computeNetPay(updatedRecord),
          }),
        });
        alert("Payroll record updated successfully!");
      }
    } catch (err) {
      console.error("Error updating payroll:", err);
      alert("Failed to update payroll record.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Payroll Management</h1>
            <p className="text-white/80 text-sm">Generate & Manage Employee Payroll Records</p>
          </div>
        </div>
      </div>

      {/* Enhanced Payroll Period */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Payroll Period</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              From Date
            </label>
            <input
              type="date"
              value={period.from}
              onChange={(e) => setPeriod({ ...period, from: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="flex flex-col group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7" />
              </svg>
              To Date
            </label>
            <input
              type="date"
              value={period.to}
              onChange={(e) => setPeriod({ ...period, to: e.target.value })}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generatePayroll}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Generate Payroll
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Payroll Records */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payroll Records</h2>
              <p className="text-white/80 text-sm">{records.length} employee records</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">No payroll records yet</p>
              <p className="text-gray-400 mt-2">Generate payroll above to see records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Department</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Base</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">OT</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Adj</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Deductions</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Net Pay</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-4 font-medium text-gray-800">{r.name}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                          {r.dept}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">₱{r.base.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">₱{r.ot.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">₱{r.adj.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">
                        ₱{Object.values(r.deductions).reduce((a, b) => a + b, 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
                          ₱{computeNetPay(r).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            key={`payslip-${r.id}`}
                            onClick={() => openPayslip(r)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            View Payslip
                          </button>
                          <button
                            key={`edit-payroll-${r.id}`}
                            onClick={() => startEdit(r)}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            Edit
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

        {/* Enhanced Edit Form */}
        {editing !== null && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Edit Payroll</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Base Salary
                </label>
                <input
                  type="number"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 group-hover:border-green-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={editForm.base}
                  onChange={(e) =>
                    setEditForm({ ...editForm, base: Number(e.target.value) })
                  }
                />
              </div>
              
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Overtime
                </label>
                <input
                  type="number"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group-hover:border-blue-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={editForm.ot}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ot: Number(e.target.value) })
                  }
                />
              </div>
              
              <div className="flex flex-col group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Adjustment
                </label>
                <input
                  type="number"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={editForm.adj}
                  onChange={(e) =>
                    setEditForm({ ...editForm, adj: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {Object.keys(editForm.deductions).map((key) => (
                <div key={key} className="flex flex-col group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    {key.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 group-hover:border-red-300 transition-all duration-200 bg-gray-50 focus:bg-white"
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

            <div className="flex gap-4 justify-center">
              <button
                onClick={saveEdit}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
