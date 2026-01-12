import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

// TimeOut Input Component with confirmation
const TimeOutInput = ({ recordId, onTimeOutUpdate }) => {
  const [timeOut, setTimeOut] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (timeOut) {
      onTimeOutUpdate(recordId, timeOut);
      setTimeOut("");
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setTimeOut("");
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="time"
        value={timeOut}
        onChange={(e) => setTimeOut(e.target.value)}
        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="Set time out"
      />
      {timeOut && (
        <div className="flex space-x-1">
          <button
            onClick={handleSubmit}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            title="Confirm time out"
          >
            ✓
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default function Attendance({ data = {} }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search states for attendance
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [filteredAttendanceEmployees, setFilteredAttendanceEmployees] = useState([]);
  const [selectedAttendanceEmployee, setSelectedAttendanceEmployee] = useState(null);
  
  // Search states for leaves
  const [leaveSearch, setLeaveSearch] = useState("");
  const [filteredLeaveEmployees, setFilteredLeaveEmployees] = useState([]);
  const [selectedLeaveEmployee, setSelectedLeaveEmployee] = useState(null);
  
  // Form state - only for Time In
  const [attendanceForm, setAttendanceForm] = useState({
    employee: "",
    date: new Date().toISOString().split('T')[0],
    timeIn: ""
  });
  
  const [leaveForm, setLeaveForm] = useState({
    employee: "",
    leaveType: "",
    reason: "",
    startDate: "",
    endDate: ""
  });

  // Get employees from props
  const employees = data?.employees || [];

  // Fetch data on component mount
  useEffect(() => {
    fetchAttendanceRecords();
    fetchLeaveRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/attendance`);
      if (response.ok) {
        const result = await response.json();
        const records = result.data || result || [];
        setAttendanceRecords(Array.isArray(records) ? records : []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRecords = async () => {
    try {
      const response = await fetch(`${API_BASE}/leaves`);
      if (response.ok) {
        const result = await response.json();
        const records = result.data || result || [];
        setLeaveRecords(Array.isArray(records) ? records : []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaveRecords([]);
    }
  };

  // Handle Time In submission
  const handleTimeInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAttendanceEmployee || !attendanceForm.timeIn) {
      alert("Please select an employee and fill in all required fields");
      return;
    }

    // Use the selected employee data
    const employeeId = selectedAttendanceEmployee?.employeeId || selectedAttendanceEmployee?.empId || '';

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...attendanceForm,
          employee: selectedAttendanceEmployee.name,
          employeeId: employeeId,
          timeOut: ""
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newRecord = result.data || result;
        setAttendanceRecords(prev => Array.isArray(prev) ? [...prev, newRecord] : [newRecord]);
        
        // Reset form
        setAttendanceForm({
          employee: "",
          date: new Date().toISOString().split('T')[0],
          timeIn: ""
        });
        setSelectedAttendanceEmployee(null);
        setAttendanceSearch("");
        alert("Time In recorded successfully!");
      }
    } catch (error) {
      console.error("Error recording time in:", error);
      alert("Error recording time in");
    } finally {
      setLoading(false);
    }
  };

  // Handle Time Out update
  const handleTimeOutUpdate = async (recordId, timeOut) => {
    if (!timeOut) {
      alert("Please enter time out");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/attendance/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeOut }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedRecord = result.data || result;
        setAttendanceRecords(prev => 
          prev.map(record => 
            record._id === recordId ? updatedRecord : record
          )
        );
        alert("Time Out recorded successfully!");
      }
    } catch (error) {
      console.error("Error recording time out:", error);
      alert("Error recording time out");
    }
  };

  // Handle Leave submission
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeaveEmployee || !leaveForm.leaveType || !leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate) {
      alert("Please select an employee and fill in all required fields");
      return;
    }

    // Use the selected employee data
    const employeeId = selectedLeaveEmployee?.employeeId || selectedLeaveEmployee?.empId || '';

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...leaveForm,
          employee: selectedLeaveEmployee.name,
          employeeId: employeeId,
          status: "Pending"
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newRecord = result.data || result;
        setLeaveRecords(prev => Array.isArray(prev) ? [...prev, newRecord] : [newRecord]);
        
        // Reset form
        setLeaveForm({
          employee: "",
          leaveType: "",
          reason: "",
          startDate: "",
          endDate: ""
        });
        setSelectedLeaveEmployee(null);
        setLeaveSearch("");
        alert("Leave application submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert("Error submitting leave application");
    } finally {
      setLoading(false);
    }
  };

  // Calculate work hours
  const calculateWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return "N/A";
    
    const start = new Date(`2000-01-01 ${timeIn}`);
    const end = new Date(`2000-01-01 ${timeOut}`);
    const diff = (end - start) / (1000 * 60 * 60);
    
    return diff > 0 ? `${diff.toFixed(1)}h` : "N/A";
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Attendance search functionality
  const handleAttendanceSearchChange = (e) => {
    const value = e.target.value;
    setAttendanceSearch(value);
    
    if (!value.trim()) {
      setFilteredAttendanceEmployees([]);
      setSelectedAttendanceEmployee(null);
      return;
    }

    const result = employees.filter((emp) =>
      emp.employeeId?.toLowerCase().includes(value.toLowerCase()) ||
      emp.name?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredAttendanceEmployees(result);
  };

  // Select employee for attendance
  const selectAttendanceEmployee = (emp) => {
    setSelectedAttendanceEmployee(emp);
    setAttendanceSearch(`${emp.name} (${emp.employeeId})`);
    setFilteredAttendanceEmployees([]);
    setAttendanceForm({
      ...attendanceForm,
      employee: emp.name
    });
  };

  // Leave search functionality
  const handleLeaveSearchChange = (e) => {
    const value = e.target.value;
    setLeaveSearch(value);
    
    if (!value.trim()) {
      setFilteredLeaveEmployees([]);
      setSelectedLeaveEmployee(null);
      return;
    }

    const result = employees.filter((emp) =>
      emp.employeeId?.toLowerCase().includes(value.toLowerCase()) ||
      emp.name?.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredLeaveEmployees(result);
  };

  // Select employee for leave
  const selectLeaveEmployee = (emp) => {
    setSelectedLeaveEmployee(emp);
    setLeaveSearch(`${emp.name} (${emp.employeeId})`);
    setFilteredLeaveEmployees([]);
    setLeaveForm({
      ...leaveForm,
      employee: emp.name
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance & Leave Management</h1>
            <p className="text-gray-600 mt-1">Track employee attendance and manage leave requests</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "attendance"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab("leaves")}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "leaves"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Leave Management
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="px-4 md:px-6 space-y-6 max-w-7xl mx-auto">
          {/* Time In Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Record Time In</h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">Log employee arrival time</p>
            </div>
            
            <div className="p-4 md:p-6">
              <form onSubmit={handleTimeInSubmit} className="space-y-4">
                {/* Employee Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Employee</label>
                  <input
                    type="text"
                    placeholder="Search by Employee ID or Name..."
                    value={attendanceSearch}
                    onChange={handleAttendanceSearchChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {/* Search Results */}
                  {filteredAttendanceEmployees.length > 0 && attendanceSearch && !selectedAttendanceEmployee && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                      {filteredAttendanceEmployees.map((emp) => (
                        <div
                          key={emp._id || emp.id}
                          onClick={() => selectAttendanceEmployee(emp)}
                          className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-700">
                                  {emp.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.employeeId} • {emp.department}</div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">Select</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No Results */}
                  {filteredAttendanceEmployees.length === 0 && attendanceSearch && (
                    <div className="mt-2 text-center py-3 text-sm text-gray-500">
                      No employees found matching "{attendanceSearch}"
                    </div>
                  )}
                </div>

                {/* Selected Employee Info */}
                {selectedAttendanceEmployee && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {selectedAttendanceEmployee.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{selectedAttendanceEmployee.name}</div>
                        <div className="text-xs text-gray-500">{selectedAttendanceEmployee.employeeId} • {selectedAttendanceEmployee.department}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAttendanceEmployee(null);
                          setAttendanceSearch("");
                          setAttendanceForm({ ...attendanceForm, employee: "" });
                        }}
                        className="ml-auto text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time In</label>
                    <input
                      type="time"
                      value={attendanceForm.timeIn}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, timeIn: e.target.value })}
                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !selectedAttendanceEmployee}
                    className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Recording..." : "Record Time In"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Attendance Records */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Attendance Records</h2>
                <button
                  onClick={fetchAttendanceRecords}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading attendance records...</span>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by recording employee time in.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Employee</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Date</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Time In</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Time Out</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Hours</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record, index) => (
                        <tr key={record._id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap w-1/4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-700">
                                    {(record.employee || "").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 truncate">{record.employee}</div>
                                <div className="text-sm text-gray-500">
                                  {record.employeeId || 
                                   employees.find(emp => emp.name === record.employee)?.employeeId || 
                                   employees.find(emp => emp.name === record.employee)?.empId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-1/8">
                            {record.date}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-1/8">
                            <span className="font-mono">
                              {record.timeIn ? record.timeIn.substring(0, 5) : "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-1/8">
                            {record.timeOut ? (
                              <span className="font-mono">{record.timeOut.substring(0, 5)}</span>
                            ) : (
                              <TimeOutInput 
                                recordId={record._id} 
                                onTimeOutUpdate={handleTimeOutUpdate}
                              />
                            )}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-1/8">
                            <span className="font-medium">
                              {calculateWorkHours(record.timeIn, record.timeOut)}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap w-1/8">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              record.timeOut ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {record.timeOut ? "Complete" : "In Progress"}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium w-1/8">
                            {!record.timeOut && (
                              <button
                                onClick={() => {
                                  const timeOut = prompt("Enter time out (HH:MM format):");
                                  if (timeOut) {
                                    handleTimeOutUpdate(record._id, timeOut);
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
                                Set Out
                              </button>
                            )}
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
      )}

      {/* Leave Management Tab */}
      {activeTab === "leaves" && (
        <div className="px-6 space-y-6">
          {/* Leave Application Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Apply for Leave</h2>
              <p className="text-gray-600 mt-1">Submit a new leave request</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                {/* Employee Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Employee</label>
                  <input
                    type="text"
                    placeholder="Search by Employee ID or Name..."
                    value={leaveSearch}
                    onChange={handleLeaveSearchChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {/* Search Results */}
                  {filteredLeaveEmployees.length > 0 && leaveSearch && !selectedLeaveEmployee && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                      {filteredLeaveEmployees.map((emp) => (
                        <div
                          key={emp._id || emp.id}
                          onClick={() => selectLeaveEmployee(emp)}
                          className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-700">
                                  {emp.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                              <div className="text-xs text-gray-500">{emp.employeeId} • {emp.department}</div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">Select</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* No Results */}
                  {filteredLeaveEmployees.length === 0 && leaveSearch && (
                    <div className="mt-2 text-center py-3 text-sm text-gray-500">
                      No employees found matching "{leaveSearch}"
                    </div>
                  )}
                </div>

                {/* Selected Employee Info */}
                {selectedLeaveEmployee && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {selectedLeaveEmployee.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{selectedLeaveEmployee.name}</div>
                        <div className="text-xs text-gray-500">{selectedLeaveEmployee.employeeId} • {selectedLeaveEmployee.department}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeaveEmployee(null);
                          setLeaveSearch("");
                          setLeaveForm({ ...leaveForm, employee: "" });
                        }}
                        className="ml-auto text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                    <select
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Leave Type</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Vacation Leave">Vacation Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a reason for your leave request..."
                    required
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !selectedLeaveEmployee}
                    className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Leave Records */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Leave Records</h2>
                <button
                  onClick={fetchLeaveRecords}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {leaveRecords.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No leave records</h3>
                  <p className="mt-1 text-sm text-gray-500">Leave applications will appear here when submitted.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leaveRecords.map((record, index) => (
                        <tr key={record._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {(record.employee || record.name || "").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.employee || record.name}</div>
                                <div className="text-sm text-gray-500">
                                  {record.employeeId || record.empId || 
                                   employees.find(emp => emp.name === (record.employee || record.name))?.employeeId || 
                                   employees.find(emp => emp.name === (record.employee || record.name))?.empId || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {record.leaveType || record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{record.startDate}</div>
                            <div className="text-gray-500">to {record.endDate}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {record.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "N/A"}
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
      )}
    </div>
  );
}