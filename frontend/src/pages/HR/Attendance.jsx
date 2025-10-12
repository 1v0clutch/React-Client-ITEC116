import React, { useState } from "react";

export default function LeaveAttendance({ data, setData }) {
  const [activeTab, setActiveTab] = useState("form");

  // States for attendance
  const [employee, setEmployee] = useState("");
  const [date, setDate] = useState("");
  const [timeInValue, setTimeInValue] = useState("");
  const [timeOutValue, setTimeOutValue] = useState("");

  // States for leave
  const [leaveEmployee, setLeaveEmployee] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const attendance = data?.attendance || [];
  const leaves = data?.leaves || [];

  // Save Time In
  const saveTimeIn = () => {
    if (!employee || !date || !timeInValue) {
      alert("Fill out all fields for Time In.");
      return;
    }
    const record = {
      id: Date.now(),
      employee,
      date,
      timeIn: timeInValue,
      timeOut: null,
    };
    setData({ ...data, attendance: [...attendance, record] });
    setEmployee("");
    setDate("");
    setTimeInValue("");
  };

  // Save Time Out
  const saveTimeOut = () => {
    const lastRecord = attendance.find(
      (rec) => rec.employee === employee && rec.date === date && !rec.timeOut
    );
    if (!lastRecord) {
      alert("No record found to time-out.");
      return;
    }
    setData({
      ...data,
      attendance: attendance.map((rec) =>
        rec.id === lastRecord.id ? { ...rec, timeOut: timeOutValue } : rec
      ),
    });
    setEmployee("");
    setDate("");
    setTimeOutValue("");
  };

  // Submit Leave
  const submitLeave = () => {
    if (!leaveEmployee || !leaveType || !reason || !startDate || !endDate) {
      alert("Fill out all leave fields.");
      return;
    }
    const leave = {
      id: Date.now(),
      employee: leaveEmployee,
      leaveType,
      reason,
      startDate,
      endDate,
    };
    setData({ ...data, leaves: [...leaves, leave] });
    setLeaveEmployee("");
    setLeaveType("");
    setReason("");
    setStartDate("");
    setEndDate("");
  };

  // Compute report
  const generateReport = () => {
    return attendance.map((rec) => {
      let workedHours = 0;
      if (rec.timeIn && rec.timeOut) {
        const start = new Date(`${rec.date}T${rec.timeIn}`);
        const end = new Date(`${rec.date}T${rec.timeOut}`);
        workedHours = (end - start) / (1000 * 60 * 60);
      }
      return {
        ...rec,
        workedHours: workedHours > 0 ? workedHours.toFixed(2) : "0.00",
        pay: (workedHours * (data.settings?.hourlyRate || 100)).toFixed(2),
      };
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave & Attendance Management</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("form")}
          className={`px-4 py-2 rounded ${
            activeTab === "form"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Attendance & Leave Form
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 rounded ${
            activeTab === "report"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Attendance Report
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded ${
            activeTab === "history"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Leaves History
        </button>
      </div>

      {/* Attendance & Leave Form */}
      {activeTab === "form" && (
        <div>
          {/* Record Attendance */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Record Attendance</h3>
            <input
              type="text"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              placeholder="Employee Name"
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <div className="flex gap-2 mb-2">
              <input
                type="time"
                value={timeInValue}
                onChange={(e) => setTimeInValue(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="time"
                value={timeOutValue}
                onChange={(e) => setTimeOutValue(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveTimeIn}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Time In
              </button>
              <button
                onClick={saveTimeOut}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Time Out
              </button>
            </div>
          </div>

          {/* Request Leave */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Request Leave</h3>
            <input
              type="text"
              value={leaveEmployee}
              onChange={(e) => setLeaveEmployee(e.target.value)}
              placeholder="Employee Name"
              className="border p-2 rounded w-full mb-2"
            />
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="">Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason"
              className="border p-2 rounded w-full mb-2"
            />
            <div className="flex gap-2 mb-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <button
              onClick={submitLeave}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit Leave Request
            </button>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {activeTab === "report" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Attendance Report</h3>
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Employee</th>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Time In</th>
                <th className="border px-3 py-2 text-left">Time Out</th>
                <th className="border px-3 py-2 text-left">Hours Worked</th>
                <th className="border px-3 py-2 text-left">Pay</th>
              </tr>
            </thead>
            <tbody>
              {generateReport().length > 0 ? (
                generateReport().map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{rec.employee}</td>
                    <td className="border px-3 py-2">{rec.date}</td>
                    <td className="border px-3 py-2">{rec.timeIn}</td>
                    <td className="border px-3 py-2">{rec.timeOut || "-"}</td>
                    <td className="border px-3 py-2">{rec.workedHours}</td>
                    <td className="border px-3 py-2">₱{rec.pay}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No attendance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leaves History */}
      {activeTab === "history" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Leaves History</h3>
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Employee</th>
                <th className="border px-3 py-2 text-left">Type</th>
                <th className="border px-3 py-2 text-left">Reason</th>
                <th className="border px-3 py-2 text-left">Start Date</th>
                <th className="border px-3 py-2 text-left">End Date</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{leave.employee}</td>
                    <td className="border px-3 py-2">{leave.leaveType}</td>
                    <td className="border px-3 py-2">{leave.reason}</td>
                    <td className="border px-3 py-2">{leave.startDate}</td>
                    <td className="border px-3 py-2">{leave.endDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No leave records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
