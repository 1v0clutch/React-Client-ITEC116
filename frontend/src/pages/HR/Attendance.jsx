import React, { useState, useEffect } from "react";

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
  };

  // UI helpers: small delay on blur so click on dropdown works
  const handleAttendanceInputBlur = () =>
    setTimeout(() => setShowAttendanceDropdown(false), 150);
  const handleLeaveInputBlur = () =>
    setTimeout(() => setShowLeaveDropdown(false), 150);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Attendance & Leave Management</h2>
            <p className="text-white/80 text-sm">Track Employee Attendance & Manage Leave Requests</p>
          </div>
        </div>
      </div>

      {!serverOnline && (
        <div className="mb-8 p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-semibold">Backend unreachable — start the server (backend) and MongoDB. API calls are disabled.</span>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 overflow-hidden">
        {/* Enhanced Tabs */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Management Tabs</h3>
              <p className="text-white/80 text-sm">Choose between attendance tracking and leave management</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("attendance");
                setSelectedEmployee(null);
                setShowAttendanceDropdown(false);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "attendance" 
                  ? "bg-white text-blue-600 shadow-lg transform scale-105" 
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Attendance
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("leaves");
                setSelectedEmployee(null);
                setShowLeaveDropdown(false);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "leaves" 
                  ? "bg-white text-blue-600 shadow-lg transform scale-105" 
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
                Leaves
              </div>
            </button>
          </div>
        </div>

        <div className="p-8">

        {/* Attendance Section */}
        {activeTab === "attendance" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Record Attendance</h2>
            </div>

            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Search Employee</label>
              </div>
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
                className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {showAttendanceDropdown &&
                attendanceSearch &&
                filteredAttendanceEmployees.length > 0 &&
                !selectedEmployee && (
                  <ul className="absolute z-10 bg-white border-2 border-gray-200 w-full rounded-xl mt-2 max-h-48 overflow-y-auto shadow-xl">
                    {filteredAttendanceEmployees.map((emp, index) => (
                      <li
                        key={emp.employeeId || index}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setAttendanceSearch(`${emp.name} (${emp.employeeId})`);
                          setShowAttendanceDropdown(false);
                        }}
                        className="p-4 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
                      >
                        <div className="font-semibold text-gray-800">{emp.name}</div>
                        <div className="text-sm text-gray-500">
                          {emp.employeeId} — {emp.department} — Hired: {emp.hireDate}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {selectedEmployee && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Selected Employee: {selectedEmployee.name}</h3>
                    <p className="text-sm text-gray-600">{selectedEmployee.employeeId} - {selectedEmployee.department}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => handleRecordAttendance("in")}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    disabled={isProcessing || !serverOnline}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Time In
                  </button>
                  <button
                    onClick={() => handleRecordAttendance("out")}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    disabled={isProcessing || !serverOnline}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Time Out
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <h3 className="text-lg font-bold text-white">Attendance Records</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Time In</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Time Out</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Overtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-semibold text-gray-500">No attendance records yet</p>
                          <p className="text-gray-400 mt-2">Record your first attendance above</p>
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((rec, i) => (
                        <tr key={rec._id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {rec.empId}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">{rec.name}</td>
                          <td className="py-4 px-4 text-gray-600">
                            {rec.timeIn ? new Date(rec.timeIn).toLocaleString() : "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {rec.timeOut ? new Date(rec.timeOut).toLocaleString() : "-"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-sm font-medium">
                              {rec.overtime}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leaves Section */}
        {activeTab === "leaves" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Apply Leave</h2>
            </div>

            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Search Employee</label>
              </div>
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
                className="border-2 border-gray-200 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />

              {showLeaveDropdown &&
                leaveSearch &&
                filteredLeaveEmployees.length > 0 &&
                !selectedEmployee && (
                  <ul className="absolute z-10 bg-white border-2 border-gray-200 w-full rounded-xl mt-2 max-h-48 overflow-y-auto shadow-xl">
                    {filteredLeaveEmployees.map((emp, index) => (
                      <li
                        key={emp.employeeId || index}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setLeaveSearch(`${emp.name} (${emp.employeeId})`);
                          setShowLeaveDropdown(false);
                        }}
                        className="p-4 hover:bg-purple-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
                      >
                        <div className="font-semibold text-gray-800">{emp.name}</div>
                        <div className="text-sm text-gray-500">
                          {emp.employeeId} — {emp.department} — Hired: {emp.hireDate}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {selectedEmployee && (
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Leave Application for: {selectedEmployee.name}</h3>
                    <p className="text-sm text-gray-600">{selectedEmployee.employeeId} - {selectedEmployee.department}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Leave Type
                    </label>
                    <select
                      value={leaveForm.type}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, type: e.target.value })
                      }
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group-hover:border-purple-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option key="select-leave" value="">Select Leave Type</option>
                      <option key="sick" value="Sick Leave">Sick Leave</option>
                      <option key="vacation" value="Vacation Leave">Vacation Leave</option>
                      <option key="emergency" value="Emergency Leave">Emergency Leave</option>
                    </select>
                  </div>

                  <div className="flex flex-col group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for leave"
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 group-hover:border-pink-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  
                  <div className="flex flex-col group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6" />
                      </svg>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, startDate: e.target.value })
                      }
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 group-hover:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  
                  <div className="flex flex-col group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7" />
                      </svg>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, endDate: e.target.value })
                      }
                      className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 group-hover:border-cyan-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleApplyLeave}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    disabled={isProcessing || !serverOnline}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Apply Leave
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                <h3 className="text-lg font-bold text-white">Leave Records</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Employee</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Reason</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Start Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">End Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRecords.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-.5 9a2 2 0 002 2h3a2 2 0 002-2L16 7m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1" />
                          </svg>
                          <p className="text-lg font-semibold text-gray-500">No leave records yet</p>
                          <p className="text-gray-400 mt-2">Apply for your first leave above</p>
                        </td>
                      </tr>
                    ) : (
                      leaveRecords.map((rec, i) => (
                        <tr key={rec._id || i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {rec.empId}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-800">{rec.name}</td>
                          <td className="py-4 px-4">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm font-medium">
                              {rec.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{rec.reason}</td>
                          <td className="py-4 px-4 text-gray-600">{rec.startDate}</td>
                          <td className="py-4 px-4 text-gray-600">{rec.endDate}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                              rec.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              rec.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleLeaveAction(i, "approve")}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                disabled={isProcessing}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleLeaveAction(i, "reject")}
                                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                disabled={isProcessing}
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleLeaveAction(i, "delete")}
                                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-2 px-3 rounded-lg text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                disabled={isProcessing}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
