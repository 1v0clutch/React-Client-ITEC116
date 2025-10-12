import React, { useState } from "react";

export default function Leaves({ data, setData }) {
  const [leave, setLeave] = useState({
    id: "",
    employee: "",
    type: "",
    reason: "",
    start: "",
    end: "",
    days: "",
    status: "Pending",
  });

  const [attendance, setAttendance] = useState({
    employee: "",
    date: "",
    timeIn: "",
    timeOut: "",
  });

  const [viewPage, setViewPage] = useState("form"); // "form", "attendance", "leavesHistory"

  // Calculate leave days
  const calcDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    if (!start || !end || e < s) return 0;
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Add leave request
  const addLeave = () => {
    if (!leave.employee || !leave.type || !leave.start || !leave.end) {
      alert("Please fill in all required fields.");
      return;
    }
    const newLeave = { ...leave, id: Date.now(), days: calcDays(leave.start, leave.end) };
    setData({ ...data, leaves: [...data.leaves, newLeave] });
    setLeave({ id: "", employee: "", type: "", reason: "", start: "", end: "", days: "", status: "Pending" });
  };

  // Update leave status
  const updateStatus = (id, status) => {
    setData({
      ...data,
      leaves: data.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
    });
  };

  // Delete leave
  const deleteLeave = (id) => {
    setData({
      ...data,
      leaves: data.leaves.filter((l) => l.id !== id),
    });
  };

  // Record time-in
  const recordTimeIn = () => {
    if (!attendance.employee || !attendance.date || !attendance.timeIn) {
      alert("Please fill in employee, date, and time-in.");
      return;
    }

    const existingIndex = (data.attendance || []).findIndex(
      (a) => a.employee === attendance.employee && a.date === attendance.date
    );

    if (existingIndex !== -1) {
      alert("Time-in already recorded for this employee on this date.");
      return;
    }

    const newRecord = { id: Date.now(), ...attendance, timeOut: "", overtime: "0.00" };
    setData({ ...data, attendance: [...(data.attendance || []), newRecord] });
    setAttendance({ employee: "", date: "", timeIn: "", timeOut: "" });
  };

  // Update time-out & overtime
  const updateTimeOut = (id, newTimeOut) => {
    const updatedAttendance = data.attendance.map((a) => {
      if (a.id === id) {
        const timeInDate = new Date(`${a.date}T${a.timeIn}`);
        const timeOutDate = new Date(`${a.date}T${newTimeOut}`);
        const hoursWorked = (timeOutDate - timeInDate) / (1000 * 60 * 60);
        const overtime = hoursWorked > 8 ? hoursWorked - 8 : 0;
        return { ...a, timeOut: newTimeOut, overtime: overtime.toFixed(2) };
      }
      return a;
    });
    setData({ ...data, attendance: updatedAttendance });
  };

  // Delete attendance record
  const deleteAttendance = (id) => {
    setData({
      ...data,
      attendance: data.attendance.filter((a) => a.id !== id),
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave & Attendance Management</h2>

      {/* Page Navigation */}
      <div className="mb-4 flex gap-3">
        <button
          className={`px-4 py-2 rounded ${viewPage === "form" ? "bg-green-500 text-white" : "bg-gray-300"}`}
          onClick={() => setViewPage("form")}
        >
          Attendance & Leave Form
        </button>
        <button
          className={`px-4 py-2 rounded ${viewPage === "attendance" ? "bg-purple-500 text-white" : "bg-gray-300"}`}
          onClick={() => setViewPage("attendance")}
        >
          Attendance Report
        </button>
        <button
          className={`px-4 py-2 rounded ${viewPage === "leavesHistory" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
          onClick={() => setViewPage("leavesHistory")}
        >
          Leaves History
        </button>
      </div>

      {/* Attendance & Leave Form */}
      {viewPage === "form" && (
        <>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Record Attendance</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={attendance.employee}
                onChange={(e) => setAttendance({ ...attendance, employee: e.target.value })}
                placeholder="Employee Name"
                className="border p-2 rounded"
              />
              <input
                type="date"
                value={attendance.date}
                onChange={(e) => setAttendance({ ...attendance, date: e.target.value })}
                className="border p-2 rounded"
              />

              <div>
                <label className="block text-sm font-medium mb-1">Time In</label>
                <input
                  type="time"
                  value={attendance.timeIn}
                  onChange={(e) => setAttendance({ ...attendance, timeIn: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Out</label>
                <input
                  type="time"
                  value={attendance.timeOut}
                  onChange={(e) => setAttendance({ ...attendance, timeOut: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={recordTimeIn}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Time In
              </button>
              <button
                onClick={() => updateTimeOut(Date.now(), attendance.timeOut)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Time Out
              </button>
            </div>
          </div>

          {/* Add Leave Form */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">Request Leave</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={leave.employee}
                onChange={(e) => setLeave({ ...leave, employee: e.target.value })}
                placeholder="Employee Name"
                className="border p-2 rounded"
              />
              <select
                value={leave.type}
                onChange={(e) => setLeave({ ...leave, type: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">Select Leave Type</option>
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Emergency">Emergency</option>
              </select>
              <input
                value={leave.reason}
                onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
                placeholder="Reason"
                className="border p-2 rounded col-span-2"
              />
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={leave.start}
                  onChange={(e) => setLeave({ ...leave, start: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={leave.end}
                  onChange={(e) => setLeave({ ...leave, end: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
            <button
              onClick={addLeave}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit Leave Request
            </button>
          </div>
        </>
      )}

      {/* Attendance Report */}
      {viewPage === "attendance" && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Attendance Report</h3>
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Employee</th>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Time In</th>
                <th className="border px-3 py-2 text-left">Time Out</th>
                <th className="border px-3 py-2 text-left">Overtime (hrs)</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.attendance && data.attendance.length > 0 ? (
                data.attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{a.employee}</td>
                    <td className="border px-3 py-2">{a.date}</td>
                    <td className="border px-3 py-2">{a.timeIn}</td>
                    <td className="border px-3 py-2">
                      <input
                        type="time"
                        value={a.timeOut}
                        onChange={(e) => updateTimeOut(a.id, e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border px-3 py-2">{a.overtime}</td>
                    <td className="border px-3 py-2">
                      <button
                        onClick={() => deleteAttendance(a.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500 italic">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Leaves History */}
      {viewPage === "leavesHistory" && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-3">Leaves History</h3>
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2 text-left">Employee</th>
                <th className="border px-3 py-2 text-left">Leave Type</th>
                <th className="border px-3 py-2 text-left">Reason</th>
                <th className="border px-3 py-2 text-left">Start Date</th>
                <th className="border px-3 py-2 text-left">End Date</th>
                <th className="border px-3 py-2 text-left">Days</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.leaves.length > 0 ? (
                data.leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{l.employee}</td>
                    <td className="border px-3 py-2">{l.type}</td>
                    <td className="border px-3 py-2">{l.reason}</td>
                    <td className="border px-3 py-2">{l.start}</td>
                    <td className="border px-3 py-2">{l.end}</td>
                    <td className="border px-3 py-2">{l.days}</td>
                    <td className="border px-3 py-2">{l.status}</td>
                    <td className="border px-3 py-2">
                      {l.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(l.id, "Approved")}
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(l.id, "Rejected")}
                            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteLeave(l.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500 italic">
                    No leave history found.
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
