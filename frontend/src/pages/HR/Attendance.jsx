import React, { useState, useEffect } from "react";

<<<<<<< HEAD
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
=======
// Use env var if available, otherwise fallback to backend port 8000
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function LeaveAttendance({ data = {} }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  const [leaveForm, setLeaveForm] = useState({
    type: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  // helper fetch functions
  const fetchAttendance = async () => {
    const url = `${API_BASE}/attendance`;
    try {
      console.log("[Attendance] GET", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch attendance (status ${res.status})`);
      const data = await res.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
      setServerOnline(true);
    } catch (err) {
      console.error("fetchAttendance error:", err);
      setServerOnline(false);
    }
  };

  const fetchLeaves = async () => {
    const url = `${API_BASE}/leaves`;
    try {
      console.log("[Leaves] GET", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch leaves (status ${res.status})`);
      const data = await res.json();
      setLeaveRecords(Array.isArray(data) ? data : []);
      setServerOnline(true);
    } catch (err) {
      console.error("fetchLeaves error:", err);
      setServerOnline(false);
    }
  };

  // Fetch attendance and leave records on mount and poll for updates
  useEffect(() => {
    fetchAttendance();
    fetchLeaves();

    const interval = setInterval(() => {
      // try fetching periodically; respects serverOnline flag for logging/behavior
      fetchAttendance();
      fetchLeaves();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Filters
  const employees = data?.employees || [];

  const filteredAttendanceEmployees = employees.filter((emp) => {
    const q = attendanceSearch.toLowerCase();
    return (
      (emp?.name || "").toLowerCase().includes(q) ||
      (emp?.employeeId || "").toLowerCase().includes(q)
    );
  });

  const filteredLeaveEmployees = employees.filter((emp) => {
    const q = leaveSearch.toLowerCase();
    return (
      (emp?.name || "").toLowerCase().includes(q) ||
      (emp?.employeeId || "").toLowerCase().includes(q)
    );
  });

  // Record attendance
  const handleRecordAttendance = async (type) => {
    if (!serverOnline) return alert("Server is offline. Start backend to record attendance.");
    if (!selectedEmployee) return alert("Please select an employee.");
    setIsProcessing(true);
    try {
      const nowIso = new Date().toISOString();

      if (type === "in") {
        const alreadyIn = attendanceRecords.find(
          (r) => r.empId === selectedEmployee.employeeId && !r.timeOut
        );
        if (alreadyIn) {
          alert("Already timed in!");
          setIsProcessing(false);
          return;
        }

        const newRecord = {
          empId: selectedEmployee.employeeId,
          name: selectedEmployee.name,
          timeIn: nowIso,
          timeOut: null,
          overtime: "0 hours",
        };

        const res = await fetch(`${API_BASE}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord),
        });
        if (!res.ok) throw new Error("Failed to save time in");
        const saved = await res.json();
        setAttendanceRecords((prev) => [...prev, saved]);
        setSelectedEmployee(null);
        setAttendanceSearch("");
        setShowAttendanceDropdown(false);
      } else if (type === "out") {
        const lastRecord = attendanceRecords
          .slice()
          .reverse()
          .find((r) => r.empId === selectedEmployee.employeeId && !r.timeOut);
        if (!lastRecord) {
          alert("No time-in record found.");
          setIsProcessing(false);
          return;
        }

        const timeIn = new Date(lastRecord.timeIn);
        const now = new Date();
        const diffHours = (now - timeIn) / (1000 * 60 * 60);
        const overtime = diffHours > 8 ? (diffHours - 8).toFixed(1) : 0;

        const res = await fetch(`${API_BASE}/attendance/${lastRecord._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timeOut: now.toISOString(),
            overtime: `${overtime} hours`,
          }),
        });
        if (!res.ok) throw new Error("Failed to save time out");
        const updated = await res.json();
        setAttendanceRecords((prev) =>
          prev.map((rec) => (rec._id === updated._id ? updated : rec))
        );
        setSelectedEmployee(null);
        setAttendanceSearch("");
        setShowAttendanceDropdown(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply Leave
  const handleApplyLeave = async () => {
    if (!serverOnline) return alert("Server is offline. Start backend to apply leave.");
    if (!selectedEmployee) return alert("Please select an employee.");
    if (
      !leaveForm.type ||
      !leaveForm.reason ||
      !leaveForm.startDate ||
      !leaveForm.endDate
    )
      return alert("Please fill all leave details.");

    setIsProcessing(true);
    try {
      const newLeave = {
        empId: selectedEmployee.employeeId,
        name: selectedEmployee.name,
        type: leaveForm.type,
        reason: leaveForm.reason,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        status: "Pending",
      };

      const res = await fetch(`${API_BASE}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeave),
      });
      if (!res.ok) throw new Error("Failed to apply leave");
      const saved = await res.json();
      setLeaveRecords((prev) => [...prev, saved]);
      setLeaveForm({ type: "", reason: "", startDate: "", endDate: "" });
      setSelectedEmployee(null);
      setLeaveSearch("");
    } catch (err) {
      console.error(err);
      alert("An error occurred. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve / Reject / Delete Leave
  const handleLeaveAction = async (index, action) => {
    if (!serverOnline) return alert("Server is offline. Start backend to perform this action.");
    const leave = leaveRecords[index];
    if (!leave) return;

    setIsProcessing(true);
    try {
      if (action === "delete") {
        const res = await fetch(`${API_BASE}/leaves/${leave._id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to delete leave");
        setLeaveRecords((prev) => prev.filter((rec) => rec._id !== leave._id));
      } else {
        const res = await fetch(`${API_BASE}/leaves/${leave._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: action === "approve" ? "Approved" : "Rejected",
          }),
        });
        if (!res.ok) throw new Error("Failed to update leave status");
        const updated = await res.json();
        setLeaveRecords((prev) =>
          prev.map((rec) => (rec._id === updated._id ? updated : rec))
        );
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
  };

  // UI helpers: small delay on blur so click on dropdown works
  const handleAttendanceInputBlur = () =>
    setTimeout(() => setShowAttendanceDropdown(false), 150);
  const handleLeaveInputBlur = () =>
    setTimeout(() => setShowLeaveDropdown(false), 150);

  return (
<<<<<<< HEAD
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
=======
    <div className="p-6 bg-gray-50 min-h-screen">
      {!serverOnline && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Backend unreachable — start the server (backend) and MongoDB. API calls are disabled.
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
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
<<<<<<< HEAD
      )}
=======

        {/* Attendance Section */}
        {activeTab === "attendance" && (
          <div>
            <h2 className="font-semibold mb-2">Record Attendance</h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={attendanceSearch}
                onChange={(e) => {
                  setAttendanceSearch(e.target.value);
                  setShowAttendanceDropdown(true);
                  setSelectedEmployee(null);
                }}
                onFocus={() => setShowAttendanceDropdown(true)}
                onBlur={handleAttendanceInputBlur}
                className="border p-2 w-full mb-2 rounded"
              />

              {showAttendanceDropdown &&
                attendanceSearch &&
                filteredAttendanceEmployees.length > 0 &&
                !selectedEmployee && (
                  <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {filteredAttendanceEmployees.map((emp, index) => (
                      <li
                        key={emp.employeeId || index}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setAttendanceSearch(`${emp.name} (${emp.employeeId})`);
                          setShowAttendanceDropdown(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.employeeId} — {emp.department} — Hired: {emp.hireDate}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {selectedEmployee && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleRecordAttendance("in")}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  disabled={isProcessing || !serverOnline}
                >
                  Time In
                </button>
                <button
                  onClick={() => handleRecordAttendance("out")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  disabled={isProcessing || !serverOnline}
                >
                  Time Out
                </button>
              </div>
            )}

            <table className="w-full mt-4 border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Employee ID</th>
                  <th className="border p-2">Employee</th>
                  <th className="border p-2">Time In</th>
                  <th className="border p-2">Time Out</th>
                  <th className="border p-2">Overtime</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec, i) => (
                  <tr key={rec._id || i}>
                    <td className="border p-2">{rec.empId}</td>
                    <td className="border p-2">{rec.name}</td>
                    <td className="border p-2">
                      {rec.timeIn ? new Date(rec.timeIn).toLocaleString() : "-"}
                    </td>
                    <td className="border p-2">
                      {rec.timeOut ? new Date(rec.timeOut).toLocaleString() : "-"}
                    </td>
                    <td className="border p-2">{rec.overtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leaves Section */}
        {activeTab === "leaves" && (
          <div>
            <h2 className="font-semibold mb-2">Apply Leave</h2>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={leaveSearch}
                onChange={(e) => {
                  setLeaveSearch(e.target.value);
                  setShowLeaveDropdown(true);
                  setSelectedEmployee(null);
                }}
                onFocus={() => setShowLeaveDropdown(true)}
                onBlur={handleLeaveInputBlur}
                className="border p-2 w-full rounded"
              />

              {showLeaveDropdown &&
                leaveSearch &&
                filteredLeaveEmployees.length > 0 &&
                !selectedEmployee && (
                  <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {filteredLeaveEmployees.map((emp, index) => (
                      <li
                        key={emp.employeeId || index}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setLeaveSearch(`${emp.name} (${emp.employeeId})`);
                          setShowLeaveDropdown(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.employeeId} — {emp.department} — Hired: {emp.hireDate}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {selectedEmployee && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <select
                    value={leaveForm.type}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, type: e.target.value })
                    }
                    className="border p-2 rounded"
                  >
                    <option value="">Select Leave Type</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Vacation Leave">Vacation Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Reason"
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, reason: e.target.value })
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, startDate: e.target.value })
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, endDate: e.target.value })
                    }
                    className="border p-2 rounded"
                  />
                </div>

                <button
                  onClick={handleApplyLeave}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={isProcessing || !serverOnline}
                >
                  Apply Leave
                </button>
              </>
            )}

            <table className="w-full mt-4 border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Employee ID</th>
                  <th className="border p-2">Employee</th>
                  <th className="border p-2">Type</th>
                  <th className="border p-2">Reason</th>
                  <th className="border p-2">Start Date</th>
                  <th className="border p-2">End Date</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRecords.map((rec, i) => (
                  <tr key={rec._id || i}>
                    <td className="border p-2">{rec.empId}</td>
                    <td className="border p-2">{rec.name}</td>
                    <td className="border p-2">{rec.type}</td>
                    <td className="border p-2">{rec.reason}</td>
                    <td className="border p-2">{rec.startDate}</td>
                    <td className="border p-2">{rec.endDate}</td>
                    <td className="border p-2">{rec.status}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleLeaveAction(i, "approve")}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-1"
                        disabled={isProcessing}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(i, "reject")}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-1"
                        disabled={isProcessing}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleLeaveAction(i, "delete")}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        disabled={isProcessing}
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
>>>>>>> 09486672ed3dcd349f4ce9c474ad2ea8eede6760
    </div>
  );
};

export default function Attendance({ data = {} }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
    if (!attendanceForm.employee || !attendanceForm.timeIn) {
      alert("Please fill in all required fields");
      return;
    }

    // Find the selected employee to get their ID
    const selectedEmployee = employees.find(emp => emp.name === attendanceForm.employee);
    const employeeId = selectedEmployee?.employeeId || selectedEmployee?.empId || '';

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...attendanceForm,
          employeeId: employeeId, // Include employee ID
          timeOut: ""
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newRecord = result.data || result;
        setAttendanceRecords(prev => Array.isArray(prev) ? [...prev, newRecord] : [newRecord]);
        setAttendanceForm({
          employee: "",
          date: new Date().toISOString().split('T')[0],
          timeIn: ""
        });
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
    if (!leaveForm.employee || !leaveForm.leaveType || !leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Find the selected employee to get their ID
    const selectedEmployee = employees.find(emp => emp.name === leaveForm.employee);
    const employeeId = selectedEmployee?.employeeId || selectedEmployee?.empId || '';

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...leaveForm,
          employeeId: employeeId, // Include employee ID
          status: "Pending"
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newRecord = result.data || result;
        setLeaveRecords(prev => Array.isArray(prev) ? [...prev, newRecord] : [newRecord]);
        setLeaveForm({
          employee: "",
          leaveType: "",
          reason: "",
          startDate: "",
          endDate: ""
        });
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
              <form onSubmit={handleTimeInSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                  <select
                    value={attendanceForm.employee}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, employee: e.target.value })}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id || emp._id} value={emp.name}>
                        {emp.name} ({emp.employeeId || emp.empId})
                      </option>
                    ))}
                  </select>
                </div>
                
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
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                    <select
                      value={leaveForm.employee}
                      onChange={(e) => setLeaveForm({ ...leaveForm, employee: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id || emp._id} value={emp.name}>
                          {emp.name} ({emp.employeeId || emp.empId})
                        </option>
                      ))}
                    </select>
                  </div>
                  
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
                    disabled={loading}
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