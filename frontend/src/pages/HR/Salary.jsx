import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

export default function Salary({ data = {} }) {
  const [employees, setEmployees] = useState([]);
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [salary, setSalary] = useState({
    employee: "",
    basePay: "",
    allowances: "",
    deductions: "",
    netPay: "",
    payDate: "",
  });

  // Fetch employees and salary records from API
  useEffect(() => {
    fetchEmployees();
    fetchSalaryRecords();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/employees`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setEmployees(data);
        setFilteredEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchSalaryRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/salary`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setSalaryList(data);
      }
    } catch (error) {
      console.error("Error fetching salary records:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search employee by Employee ID or Name
  const handleSearch = () => {
    if (!search.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const result = employees.filter((e) =>
      e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      e.name?.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredEmployees(result);

    // Auto-populate if exact match found
    if (result.length === 1) {
      const emp = result[0];
      setSalary({
        employee: emp.name,
        empId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        basePay: "",
        allowances: "",
        deductions: "",
        netPay: "",
        payDate: new Date().toISOString().split('T')[0],
      });
      setShowForm(true);
    }
  };

  // Handle search input change with real-time filtering
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    if (!value.trim()) {
      setFilteredEmployees([]);
      return;
    }

    const result = employees.filter((emp) =>
      emp.employeeId?.toLowerCase().includes(value.toLowerCase()) ||
      emp.name?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredEmployees(result);
  };

  // Select employee from search results
  const selectEmployee = (emp) => {
    setSalary({
      employee: emp.name,
      empId: emp.employeeId,
      name: emp.name,
      department: emp.department,
      basePay: "",
      allowances: "",
      deductions: "",
      netPay: "",
      payDate: new Date().toISOString().split('T')[0],
    });
    setSearch(`${emp.name} (${emp.employeeId})`);
    setFilteredEmployees([]);
    setShowForm(true);
  };

  const calculateTotal = () => {
    const base = parseFloat(salary.basePay) || 0;
    const allowances = parseFloat(salary.allowances) || 0;
    const deduct = parseFloat(salary.deductions) || 0;
    return base + allowances - deduct;
  };

  const addSalaryRecord = async () => {
    if (!salary.employee || !salary.basePay || !salary.payDate) {
      alert("Please complete required fields!");
      return;
    }

    const total = calculateTotal();

    const newRecord = {
      employee: salary.employee,
      basePay: parseFloat(salary.basePay),
      allowances: parseFloat(salary.allowances) || 0,
      deductions: parseFloat(salary.deductions) || 0,
      netPay: total,
      payDate: salary.payDate,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/salary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      if (response.ok) {
        fetchSalaryRecords();
        setSalary({
          employee: "",
          empId: "",
          name: "",
          department: "",
          basePay: "",
          allowances: "",
          deductions: "",
          netPay: "",
          payDate: "",
        });
        setSearch("");
        setFilteredEmployees([]);
        setShowForm(false);
        alert("Salary record added successfully!");
      }
    } catch (error) {
      console.error("Error adding salary record:", error);
      alert("Error adding salary record");
    } finally {
      setLoading(false);
    }
  };

  // Print Salary Slip
  const printSlip = (record) => {
    const slipWindow = window.open("", "_blank");
    const slipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Slip - ${record.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .company { font-size: 24px; font-weight: bold; color: #333; }
          .slip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-section { flex: 1; }
          .info-label { font-weight: bold; color: #555; }
          .salary-details { margin-bottom: 20px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; }
          .detail-value { color: #2563eb; }
          .total-section { border-top: 2px solid #333; padding-top: 15px; margin-top: 20px; }
          .total-salary { font-size: 20px; font-weight: bold; color: #16a34a; text-align: center; }
          .print-btn { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">EMS Company</div>
          <div class="slip-title">Salary Slip</div>
        </div>
        
        <div class="employee-info">
          <div class="info-section">
            <div><span class="info-label">Employee ID:</span> ${record.empId}</div>
            <div><span class="info-label">Name:</span> ${record.name}</div>
            <div><span class="info-label">Department:</span> ${record.department}</div>
          </div>
          <div class="info-section">
            <div><span class="info-label">Date Generated:</span> ${new Date(record.dateCreated).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="salary-details">
          <div class="detail-row">
            <span class="detail-label">Base Salary</span>
            <span class="detail-value">₱${parseFloat(record.baseSalary).toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bonus</span>
            <span class="detail-value">₱${parseFloat(record.bonus || 0).toLocaleString()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Deductions</span>
            <span class="detail-value" style="color: #dc2626;">-₱${parseFloat(record.deductions || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-salary">
            Total Salary: ₱${parseFloat(record.totalSalary).toLocaleString()}
          </div>
        </div>
        
        <button class="print-btn" onclick="window.print()">Print Salary Slip</button>
      </body>
      </html>
    `;
    
    slipWindow.document.write(slipContent);
    slipWindow.document.close();
  };

  // Delete salary record
  const deleteSalaryRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/salary/${id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          fetchSalaryRecords();
          alert("Salary record deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting salary record:", error);
        alert("Error deleting salary record");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
            <p className="text-gray-600 mt-1">Manage employee salary records and generate salary slips</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setSalary({
                employee: "",
                empId: "",
                name: "",
                department: "",
                basePay: "",
                allowances: "",
                deductions: "",
                netPay: "",
                payDate: "",
              });
              setSearch("");
              setFilteredEmployees([]);
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Salary Record
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                  <dd className="text-lg font-medium text-gray-900">{salaryList.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Salaries</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₱{salaryList.reduce((sum, record) => sum + parseFloat(record.netPay || 0), 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Search Employee</h2>
            <p className="text-gray-600 mt-1">Find an employee to create salary record</p>
          </div>
          
          <div className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by Employee ID or Name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Search Results */}
            {filteredEmployees.length > 0 && search && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results ({filteredEmployees.length}):</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp._id || emp.id}
                      onClick={() => selectEmployee(emp)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {emp.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                          <div className="text-sm text-gray-500">{emp.employeeId} • {emp.department}</div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Select</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredEmployees.length === 0 && search && (
              <div className="mt-4 text-center py-4">
                <div className="text-sm text-gray-500">No employees found matching "{search}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Salary Records */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Salary Records ({salaryList.length})
            </h2>
          </div>
          
          <div className="p-6">
            {salaryList.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No salary records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first salary record.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salaryList.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {record.employee.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{record.employee}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{parseFloat(record.basePay).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₱{parseFloat(record.allowances || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          ₱{parseFloat(record.deductions || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          ₱{parseFloat(record.netPay).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.payDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => printSlip(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Print Slip
                          </button>
                          <button
                            onClick={() => deleteSalaryRecord(record._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
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

      {/* Salary Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Salary Record</h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSalary({
                      employee: "",
                      empId: "",
                      name: "",
                      department: "",
                      basePay: "",
                      allowances: "",
                      deductions: "",
                      netPay: "",
                      payDate: "",
                    });
                    setSearch("");
                    setFilteredEmployees([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={salary.empId}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                    <input
                      type="text"
                      value={salary.name}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={salary.department}
                      readOnly
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Pay *</label>
                  <input
                    type="number"
                    value={salary.basePay}
                    onChange={(e) => setSalary({ ...salary, basePay: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter base pay"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowances</label>
                    <input
                      type="number"
                      value={salary.allowances}
                      onChange={(e) => setSalary({ ...salary, allowances: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter allowances"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deductions</label>
                    <input
                      type="number"
                      value={salary.deductions}
                      onChange={(e) => setSalary({ ...salary, deductions: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter deduction amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Date *</label>
                  <input
                    type="date"
                    value={salary.payDate}
                    onChange={(e) => setSalary({ ...salary, payDate: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Total Calculation Display */}
                {salary.basePay && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Net Pay: ₱{calculateTotal().toLocaleString()}</strong>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Base Pay (₱{parseFloat(salary.basePay || 0).toLocaleString()}) + 
                      Allowances (₱{parseFloat(salary.allowances || 0).toLocaleString()}) - 
                      Deductions (₱{parseFloat(salary.deductions || 0).toLocaleString()})
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSalary({
                      employee: "",
                      empId: "",
                      name: "",
                      department: "",
                      basePay: "",
                      allowances: "",
                      deductions: "",
                      netPay: "",
                      payDate: "",
                    });
                    setSearch("");
                    setFilteredEmployees([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addSalaryRecord}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Salary Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}