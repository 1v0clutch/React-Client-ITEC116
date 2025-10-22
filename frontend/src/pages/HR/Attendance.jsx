import React, { useState, useEffect } from "react";

export default function LeaveAttendance({ data, setData }) {
  const [activeTab, setActiveTab] = useState("attendance");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [leaveForm, setLeaveForm] = useState({
    type: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  // ✅ Load saved data from localStorage (para di nawawala after refresh)
  useEffect(() => {
    const savedAttendance = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    const savedLeaves = JSON.parse(localStorage.getItem("leaveRecords")) || [];
    setAttendanceRecords(savedAttendance);
    setLeaveRecords(savedLeaves);
  }, []);

  // ✅ Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("leaveRecords", JSON.stringify(leaveRecords));
  }, [leaveRecords]);

  // ✅ Filter employees by name or employee ID
  const filteredEmployees =
    data?.employees?.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // ✅ Record attendance with overtime computation
  const handleRecordAttendance = (type) => {
    if (!selectedEmployee) return alert("Please select an employee.");
    const now = new Date();
    let updated = [...attendanceRecords];
    const existingIndex = updated.findIndex(
      (r) => r.employeeId === selectedEmployee.id && !r.timeOut
    );

    if (type === "in") {
      if (existingIndex !== -1) return alert("Already timed in!");
      updated.push({
        employeeId: selectedEmployee.id,
        empId: selectedEmployee.empId,
        name: selectedEmployee.name,
        timeIn: now,
        timeOut: null,
        overtime: "0 hours",
      });
    } else if (type === "out") {
      if (existingIndex === -1) return alert("No time-in record found.");
      const timeIn = new Date(updated[existingIndex].timeIn);
      const diffHours = (now - timeIn) / (1000 * 60 * 60);
      const overtime = diffHours > 8 ? (diffHours - 8).toFixed(1) : 0;
      updated[existingIndex].timeOut = now;
      updated[existingIndex].overtime = `${overtime} hours`;
    }

    setAttendanceRecords(updated);
    setSelectedEmployee(null);
    setSearchQuery("");
  };

  // ✅ Apply leave with dropdown leave type
  const handleApplyLeave = () => {
    if (!selectedEmployee) return alert("Please select an employee.");
    if (!leaveForm.type || !leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate)
      return alert("Please fill all leave details.");

    const newLeave = {
      employeeId: selectedEmployee.id,
      empId: selectedEmployee.empId,
      name: selectedEmployee.name,
      type: leaveForm.type,
      reason: leaveForm.reason,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      status: "Pending",
    };

    setLeaveRecords([...leaveRecords, newLeave]);
    setLeaveForm({ type: "", reason: "", startDate: "", endDate: "" });
    setSelectedEmployee(null);
    setSearchQuery("");
  };

  const handleLeaveAction = (index, action) => {
    let updated = [...leaveRecords];
    if (action === "delete") {
      updated.splice(index, 1);
    } else {
      updated[index].status = action === "approve" ? "Approved" : "Rejected";
    }
    setLeaveRecords(updated);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-4 py-2 rounded ${
              activeTab === "attendance" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
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

            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSelectedEmployee(null);
                }}
                className="border p-2 w-full mb-2 rounded"
              />

              {showDropdown && searchQuery && filteredEmployees.length > 0 && !selectedEmployee && (
                <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <li
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setSearchQuery(`${emp.name} (${emp.empId})`);
                        setShowDropdown(false);
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
                >
                  Time In
                </button>
                <button
                  onClick={() => handleRecordAttendance("out")}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Time Out
                </button>
              </div>
            )}

            {/* Attendance Table */}
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
                  <tr key={i}>
                    <td className="border p-2">{rec.empId}</td>
                    <td className="border p-2">{rec.name}</td>
                    <td className="border p-2">
                      {rec.timeIn ? new Date(rec.timeIn).toLocaleTimeString() : "-"}
                    </td>
                    <td className="border p-2">
                      {rec.timeOut ? new Date(rec.timeOut).toLocaleTimeString() : "-"}
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

            {/* Search bar */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search employee by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSelectedEmployee(null);
                }}
                className="border p-2 w-full rounded"
              />

              {showDropdown && searchQuery && filteredEmployees.length > 0 && !selectedEmployee && (
                <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <li
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setSearchQuery(`${emp.name} (${emp.empId})`);
                        setShowDropdown(false);
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

            {/* Leave Form */}
            {selectedEmployee && (
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
            )}

            {selectedEmployee && (
              <button
                onClick={handleApplyLeave}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Apply Leave
              </button>
            )}

            {/* Leave Table */}
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
                  <tr key={i}>
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
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveAction(i, "reject")}
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-1"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleLeaveAction(i, "delete")}
                        className="bg-red-500 text-white px-2 py-1 rounded"
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
