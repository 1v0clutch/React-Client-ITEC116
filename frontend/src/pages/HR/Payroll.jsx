import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Payroll({ data }) {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]); // Generated payroll records
  const [existingRecords, setExistingRecords] = useState([]); // Existing payroll records from DB
  const [period, setPeriod] = useState({ from: "", to: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    base: 0,
    ot: 0,
    adj: 0,
    deductions: {},
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployees();
    fetchPayrollRecords();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/employees`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch employees:", response.status, response.statusText);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/payroll`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setExistingRecords(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch payroll records:", response.status, response.statusText);
        setExistingRecords([]);
      }
    } catch (error) {
      console.error("Error fetching payroll records:", error);
      setExistingRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Compute Net Pay
  const computeNetPay = (r) => {
    const totalDed = Object.values(r.deductions).reduce((a, b) => a + b, 0);
    return r.base + r.ot + r.adj - totalDed;
  };

  // Compute Gross Pay
  const computeGrossPay = (r) => r.base + r.ot + r.adj;

  // Generate Payroll
  const generatePayroll = () => {
    if (!period.from || !period.to) {
      alert("Please select payroll period first");
      return;
    }

    if (employees.length === 0) {
      alert("No employees found. Please refresh employees first.");
      return;
    }

    setLoading(true);
    
    const newRecords = employees.map((emp) => ({
      _id: emp._id || emp.id,
      employeeId: emp.employeeId || emp.empId,
      name: emp.name,
      department: emp.department,
      position: emp.position,
      base: 25000, // Default base salary
      ot: 0,
      adj: 0,
      deductions: {
        sss: 500,
        philhealth: 300,
        pagibig: 200,
        tax: 1000,
      },
    }));

    setRecords(newRecords);
    setLoading(false);
    alert(`Payroll generated for ${newRecords.length} employees`);
  };

  // Save Payroll to Backend
  const savePayrollToBackend = async (recordsToSave = records) => {
    try {
      if (recordsToSave.length === 0) {
        alert("No payroll records to save.");
        return;
      }

      setLoading(true);
      await Promise.all(
        recordsToSave.map((r) =>
          fetch(`${API_BASE}/payroll`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: r.employeeId,
              name: r.name,
              department: r.department,
              payPeriod: `${period.from} - ${period.to}`,
              grossPay: computeGrossPay(r),
              deductions: Object.values(r.deductions).reduce((a, b) => a + b, 0),
              netPay: computeNetPay(r),
            }),
          })
        )
      );

      fetchPayrollRecords();
      alert("Payroll records saved successfully!");
    } catch (err) {
      console.error("Error saving payroll:", err);
      alert("Failed to save payroll records.");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a record
  const startEdit = (record) => {
    setEditing(record._id);
    setEditForm({
      base: record.base,
      ot: record.ot,
      adj: record.adj,
      deductions: { ...record.deductions },
    });
  };

  // Save edited record
  const saveEdit = () => {
    setRecords(records.map(r => 
      r._id === editing 
        ? { ...r, ...editForm }
        : r
    ));
    setEditing(null);
    setEditForm({ base: 0, ot: 0, adj: 0, deductions: {} });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditing(null);
    setEditForm({ base: 0, ot: 0, adj: 0, deductions: {} });
  };

  // Open Payslip
  const openPayslip = (rec) => {
    const payslipWindow = window.open("", "_blank");
    const payslipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${rec.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .company { font-size: 24px; font-weight: bold; color: #333; }
          .payslip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-section { flex: 1; }
          .info-label { font-weight: bold; color: #555; }
          .earnings-deductions { display: flex; gap: 40px; margin-bottom: 20px; }
          .section { flex: 1; }
          .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .line-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-section { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; }
          .net-pay { font-size: 18px; font-weight: bold; color: #2563eb; }
          .print-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">EMS Company</div>
          <div class="payslip-title">Employee Payslip</div>
        </div>
        
        <div class="employee-info">
          <div class="info-section">
            <div><span class="info-label">Employee ID:</span> ${rec.employeeId}</div>
            <div><span class="info-label">Name:</span> ${rec.name}</div>
            <div><span class="info-label">Department:</span> ${rec.department}</div>
          </div>
          <div class="info-section">
            <div><span class="info-label">Position:</span> ${rec.position}</div>
            <div><span class="info-label">Pay Period:</span> ${period.from} - ${period.to}</div>
            <div><span class="info-label">Date Generated:</span> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="earnings-deductions">
          <div class="section">
            <div class="section-title">Earnings</div>
            <div class="line-item">
              <span>Basic Salary</span>
              <span>₱${rec.base.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Overtime</span>
              <span>₱${rec.ot.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Adjustments</span>
              <span>₱${rec.adj.toLocaleString()}</span>
            </div>
            <div class="line-item" style="border-top: 1px solid #ccc; padding-top: 5px; font-weight: bold;">
              <span>Gross Pay</span>
              <span>₱${computeGrossPay(rec).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Deductions</div>
            <div class="line-item">
              <span>SSS</span>
              <span>₱${rec.deductions.sss.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>PhilHealth</span>
              <span>₱${rec.deductions.philhealth.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Pag-IBIG</span>
              <span>₱${rec.deductions.pagibig.toLocaleString()}</span>
            </div>
            <div class="line-item">
              <span>Tax</span>
              <span>₱${rec.deductions.tax.toLocaleString()}</span>
            </div>
            <div class="line-item" style="border-top: 1px solid #ccc; padding-top: 5px; font-weight: bold;">
              <span>Total Deductions</span>
              <span>₱${Object.values(rec.deductions).reduce((a, b) => a + b, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="total-section">
          <div class="line-item net-pay">
            <span>Net Pay</span>
            <span>₱${computeNetPay(rec).toLocaleString()}</span>
          </div>
        </div>
        
        <button class="print-btn" onclick="window.print()">Print Payslip</button>
      </body>
      </html>
    `;
    
    payslipWindow.document.write(payslipContent);
    payslipWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600 mt-1">Generate and manage employee payroll</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Payroll Generation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Generate Payroll</h2>
            <p className="text-gray-600 mt-1">Set payroll period and generate records for active employees</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={period.from}
                  onChange={(e) => setPeriod({ ...period, from: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={period.to}
                  onChange={(e) => setPeriod({ ...period, to: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <button
                  onClick={generatePayroll}
                  disabled={loading || !period.from || !period.to}
                  className="w-full inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Generate Payroll
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {period.from && period.to && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-800">
                    Payroll will be generated for period: <strong>{period.from}</strong> to <strong>{period.to}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Existing Payroll Records */}
        {existingRecords.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Existing Payroll Records</h2>
              <p className="text-gray-600 mt-1">Previously saved payroll records</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingRecords.slice(0, 10).map((record, index) => (
                      <tr key={record._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">{record.employeeId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{record.grossPay?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          ₱{record.netPay?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Generated Payroll Records */}
        {records.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payroll Records</h2>
                  <p className="text-gray-600 mt-1">
                    Period: {period.from} to {period.to} • {records.length} employees
                  </p>
                </div>
                <button
                  onClick={() => savePayrollToBackend()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Save All Records
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">{record.employeeId} • {record.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editing === record._id ? (
                            <input
                              type="number"
                              value={editForm.base}
                              onChange={(e) => setEditForm({ ...editForm, base: parseFloat(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            `₱${record.base.toLocaleString()}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editing === record._id ? (
                            <input
                              type="number"
                              value={editForm.ot}
                              onChange={(e) => setEditForm({ ...editForm, ot: parseFloat(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            `₱${record.ot.toLocaleString()}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₱{editing === record._id ? 
                            (editForm.base + editForm.ot + editForm.adj).toLocaleString() : 
                            computeGrossPay(record).toLocaleString()
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          ₱{editing === record._id ? 
                            ((editForm.base + editForm.ot + editForm.adj) - Object.values(editForm.deductions).reduce((a, b) => a + b, 0)).toLocaleString() : 
                            computeNetPay(record).toLocaleString()
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {editing === record._id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(record)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openPayslip(record)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Payslip
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && records.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set a payroll period and generate records to get started.
              </p>
              {employees.length === 0 && (
                <p className="mt-2 text-sm text-red-500">
                  No employees found. Please check if employees are loaded.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Loading...</h3>
              <p className="mt-1 text-sm text-gray-500">
                Fetching payroll data...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}