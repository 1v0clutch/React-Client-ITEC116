import React, { useState, useEffect } from "react";

const API_BASE = process.env.API_BASE || "http://localhost:8000/api";

export default function LeaveForm({ employees = [] }) {
  const [leaveSearch, setLeaveSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "", reason: "", startDate: "", endDate: "" });

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await fetch(`${API_BASE}/leaves`);
        if (res.ok) {
          const data = await res.json();
          setLeaveRecords(data);
        }
      } catch (err) {
        console.error("Error fetching leaves:", err);
      }
    };
    fetchLeaves();
  }, []);

  const filteredLeaveEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(leaveSearch.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(leaveSearch.toLowerCase())
  );

  const handleApplyLeave = async () => {
    if (!selectedEmployee) return alert("Please select an employee.");
    if (!leaveForm.type || !leaveForm.reason || !leaveForm.startDate || !leaveForm.endDate)
      return alert("Please fill all leave details.");

    const newLeave = {
      empId: selectedEmployee.employeeId,
      name: selectedEmployee.name,
      employee: selectedEmployee.name,
      type: leaveForm.type,
      leaveType: leaveForm.type,
      reason: leaveForm.reason,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      status: "Pending",
    };

    try {
      const res = await fetch(`${API_BASE}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeave),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setLeaveRecords([...leaveRecords, saved]);
      setLeaveForm({ type: "", reason: "", startDate: "", endDate: "" });
      setSelectedEmployee(null);
      setLeaveSearch("");
      alert("Leave application submitted successfully!");
    } catch (error) {
      console.error("Error applying leave:", error);
      alert("Failed to submit leave application. Please try again.");
    }
  };

  const handleLeaveAction = async (index, action) => {
    const leave = leaveRecords[index];
    if (action === "delete") {
      try {
        const res = await fetch(`${API_BASE}/leaves/${leave._id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLeaveRecords(leaveRecords.filter((_, i) => i !== index));
        alert("Leave record deleted successfully!");
      } catch (error) {
        console.error("Error deleting leave:", error);
        alert("Failed to delete leave record. Please try again.");
      }
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/leaves/${leave._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "Approved" : "Rejected" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setLeaveRecords(leaveRecords.map((rec) => (rec._id === updated._id ? updated : rec)));
      alert(`Leave ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing leave:`, error);
      alert(`Failed to ${action} leave. Please try again.`);
    }
  };

  return (
    <div>
      <h2 className="font-semibold mb-2">Apply Leave</h2>

      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search employee by name or ID..."
          value={leaveSearch}
          onChange={(e) => { setLeaveSearch(e.target.value); setShowLeaveDropdown(true); setSelectedEmployee(null); }}
          className="border p-2 w-full rounded"
        />

        {showLeaveDropdown && leaveSearch && filteredLeaveEmployees.length > 0 && !selectedEmployee && (
          <ul className="absolute z-10 bg-white border w-full rounded mt-1 max-h-48 overflow-y-auto">
            {filteredLeaveEmployees.map((emp) => (
              <li
                key={emp.employeeId}
                onClick={() => { setSelectedEmployee(emp); setLeaveSearch(`${emp.name} (${emp.employeeId})`); setShowLeaveDropdown(false); }}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              >
                <div className="font-semibold">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.employeeId} — {emp.department} — Hired: {emp.hireDate}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedEmployee && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="border p-2 rounded">
              <option value="">Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
            <input type="text" placeholder="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="border p-2 rounded" />
            <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })} className="border p-2 rounded" />
            <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })} className="border p-2 rounded" />
          </div>
          <button onClick={handleApplyLeave} className="bg-blue-500 text-white px-4 py-2 rounded">Apply Leave</button>
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
            <tr key={i}>
              <td className="border p-2">{rec.empId}</td>
              <td className="border p-2">{rec.name}</td>
              <td className="border p-2">{rec.type}</td>
              <td className="border p-2">{rec.reason}</td>
              <td className="border p-2">{rec.startDate}</td>
              <td className="border p-2">{rec.endDate}</td>
              <td className="border p-2">{rec.status}</td>
              <td className="border p-2 text-center">
                <button onClick={() => handleLeaveAction(i, "approve")} className="bg-green-500 text-white px-2 py-1 rounded mr-1">Approve</button>
                <button onClick={() => handleLeaveAction(i, "reject")} className="bg-yellow-500 text-white px-2 py-1 rounded mr-1">Reject</button>
                <button onClick={() => handleLeaveAction(i, "delete")} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
