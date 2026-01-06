import React, { useState, useEffect } from "react";

const API_BASE = process.env.API_BASE || "http://localhost:8000/api";

export default function AttendanceForm({ employees = [] }) {
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_BASE}/attendance`);
        if (res.ok) {
          const data = await res.json();
          setAttendanceRecords(data);
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };
    fetchAttendance();
  }, []);

  const filteredAttendanceEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(attendanceSearch.toLowerCase())
  );

  const handleRecordAttendance = async (type) => {
    if (!selectedEmployee) return alert("Please select an employee.");
    const now = new Date();

    if (type === "in") {
      const alreadyIn = attendanceRecords.find(
        (r) => r.empId === selectedEmployee.employeeId && !r.timeOut
      );
      if (alreadyIn) return alert("Already timed in!");

      const newRecord = {
        empId: selectedEmployee.employeeId,
        name: selectedEmployee.name,
        employee: selectedEmployee.name,
        timeIn: now,
        timeOut: null,
        overtime: "0 hours",
      };

      try {
        const res = await fetch(`${API_BASE}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const saved = await res.json();
        setAttendanceRecords([...attendanceRecords, saved]);
        alert("Time in recorded successfully!");
      } catch (error) {
        console.error("Error recording time in:", error);
        alert("Failed to record time in. Please try again.");
      }
    } else if (type === "out") {
      const lastRecord = attendanceRecords.find(
        (r) => r.empId === selectedEmployee.employeeId && !r.timeOut
      );
      if (!lastRecord) return alert("No time-in record found.");

      const timeIn = new Date(lastRecord.timeIn);
      const diffHours = (now - timeIn) / (1000 * 60 * 60);
      const overtime = diffHours > 8 ? (diffHours - 8).toFixed(1) : 0;

      try {
        const res = await fetch(`${API_BASE}/attendance/${lastRecord._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeOut: now, overtime: `${overtime} hours` }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        setAttendanceRecords(
          attendanceRecords.map((rec) => (rec._id === updated._id ? updated : rec))
        );
        alert("Time out recorded successfully!");
      } catch (error) {
        console.error("Error recording time out:", error);
        alert("Failed to record time out. Please try again.");
      }
    }

    setSelectedEmployee(null);
    setAttendanceSearch("");
  };

  return (
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
          className="border p-2 w-full mb-2 rounded"
        />

        {showAttendanceDropdown &&
          attendanceSearch &&
          filteredAttendanceEmployees.length > 0 &&
          !selectedEmployee && (
            <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
              {filteredAttendanceEmployees.map((emp) => (
                <li
                  key={emp.employeeId}
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
              <td className="border p-2">{rec.timeIn ? new Date(rec.timeIn).toLocaleTimeString() : "-"}</td>
              <td className="border p-2">{rec.timeOut ? new Date(rec.timeOut).toLocaleTimeString() : "-"}</td>
              <td className="border p-2">{rec.overtime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
