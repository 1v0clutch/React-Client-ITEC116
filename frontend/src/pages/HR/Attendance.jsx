import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api";

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
    try {
      const res = await fetch(`${API_BASE}/attendance`);
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
      setServerOnline(true);
    } catch (err) {
      console.error("fetchAttendance error:", err);
      setServerOnline(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_BASE}/leaves`);
      if (!res.ok) throw new Error("Failed to fetch leaves");
      const data = await res.json();
      setLeaveRecords(Array.isArray(data) ? data : []);
      setServerOnline(true);
    } catch (err) {
      console.error("fetchLeaves error:", err);
      setServerOnline(false);
    }
  };

  // Fetch attendance and leave records on mount
  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
  }, []);

  // Filters
  const employees = data?.employees || [];

  const filteredAttendanceEmployees = employees.filter((emp) => {
    const q = attendanceSearch.toLowerCase();
    return (
      (emp?.name || "").toLowerCase().includes(q) ||
      (emp?.empId || "").toLowerCase().includes(q)
    );
  });

  const filteredLeaveEmployees = employees.filter((emp) => {
    const q = leaveSearch.toLowerCase();
    return (
      (emp?.name || "").toLowerCase().includes(q) ||
      (emp?.empId || "").toLowerCase().includes(q)
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
          (r) => r.empId === selectedEmployee.empId && !r.timeOut
        );
        if (alreadyIn) {
          alert("Already timed in!");
          return;
        }

        const newRecord = {
          empId: selectedEmployee.empId,
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
      } else if (type === "out") {
        const lastRecord = attendanceRecords
          .slice()
          .reverse()
          .find((r) => r.empId === selectedEmployee.empId && !r.timeOut);
        if (!lastRecord) {
          alert("No time-in record found.");
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
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Check console for details.");
    } finally {
      setIsProcessing(false);
      setSelectedEmployee(null);
      setAttendanceSearch("");
      setShowAttendanceDropdown(false);
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
        empId: selectedEmployee.empId,
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
    const leave = leaveRecords[index];
    if (!leave) return;
    if (action === "delete") {
      // optimistic UI delete (implement backend DELETE if desired)
      setLeaveRecords((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setIsProcessing(true);
    try {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {!serverOnline && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          Backend unreachable — start the server (backend) and MongoDB. API calls are disabled.
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setActiveTab("attendance");
              setSelectedEmployee(null);
              setShowAttendanceDropdown(false);
            }}
            className={`px-4 py-2 rounded ${
              activeTab === "attendance" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => {
              setActiveTab("leaves");
              setSelectedEmployee(null);
              setShowLeaveDropdown(false);
            }}
            className={`px-4 py-2 rounded ${
              activeTab === "leaves" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Leaves
          </button>
        </div>

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
                    {filteredAttendanceEmployees.map((emp) => (
                      <li
                        key={emp.empId}
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setAttendanceSearch(`${emp.name} (${emp.empId})`);
                          setShowAttendanceDropdown(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.empId} — {emp.department} — Hired: {emp.hireDate}
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
                    {filteredLeaveEmployees.map((emp) => (
                      <li
                        key={emp.empId}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setLeaveSearch(`${emp.name} (${emp.empId})`);
                          setShowLeaveDropdown(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{emp.name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.empId} — {emp.department} — Hired: {emp.hireDate}
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
    </div>
  );
}
