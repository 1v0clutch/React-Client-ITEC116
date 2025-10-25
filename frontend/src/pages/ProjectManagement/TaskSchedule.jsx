import React, { useState } from "react";

/*
  Task Schedule UI with sample data ready for backend integration.
  - Inline edit per row (Edit / Cancel / Save)
  - Global "Save Schedule" button (calls placeholder API)
  - Dependency badges and status labels
*/

const sampleTasks = [
  {
    id: 11,
    code: "#11",
    name: "Requirements Gathering",
    start: "2025-10-01",
    end: "2025-10-07",
    duration: 7,
    assignee: "John Doe",
    dependency: null,
    status: "Completed",
  },
  {
    id: 12,
    code: "#12",
    name: "Wireframe Creation",
    start: "2025-10-08",
    end: "2025-10-15",
    duration: 8,
    assignee: "Jane Smith",
    dependency: 11,
    status: "Completed",
  },
  {
    id: 13,
    code: "#13",
    name: "UI/UX Design",
    start: "2025-10-16",
    end: "2025-10-31",
    duration: 16,
    assignee: "Bob Wilson",
    dependency: 12,
    status: "Completed",
  },
  {
    id: 21,
    code: "#21",
    name: "Frontend Development",
    start: "2025-11-01",
    end: "2025-11-20",
    duration: 20,
    assignee: "Alice Brown",
    dependency: 13,
    status: "In Progress",
  },
  {
    id: 22,
    code: "#22",
    name: "Backend API Development",
    start: "2025-11-01",
    end: "2025-11-25",
    duration: 25,
    assignee: "Charlie Davis",
    dependency: 13,
    status: "In Progress",
  },
  {
    id: 23,
    code: "#23",
    name: "Database Setup",
    start: "2025-11-05",
    end: "2025-11-15",
    duration: 11,
    assignee: "David Lee",
    dependency: 22,
    status: "Completed",
  },
  {
    id: 24,
    code: "#24",
    name: "Integration Testing",
    start: "2025-11-21",
    end: "2025-11-30",
    duration: 10,
    assignee: "Eva Martinez",
    dependency: [21, 22],
    status: "In Progress",
  },
  {
    id: 31,
    code: "#31",
    name: "QA Testing",
    start: "2025-12-01",
    end: "2025-12-15",
    duration: 15,
    assignee: "Frank Garcia",
    dependency: 24,
    status: "In Progress",
  },
  {
    id: 32,
    code: "#32",
    name: "Bug Fixes",
    start: "2025-12-16",
    end: "2025-12-22",
    duration: 7,
    assignee: "Alice Brown",
    dependency: 31,
    status: "Not Started",
  },
  {
    id: 33,
    code: "#33",
    name: "Deployment",
    start: "2025-12-23",
    end: "2025-12-26",
    duration: 4,
    assignee: "Charlie Davis",
    dependency: 32,
    status: "Not Started",
  },
  {
    id: 34,
    code: "#34",
    name: "Post-Launch Monitoring",
    start: "2025-12-27",
    end: "2025-12-31",
    duration: 5,
    assignee: "John Doe",
    dependency: 33,
    status: "Not Started",
  },
];

function StatusBadge({ status }) {
  const map = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Not Started": "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TaskSchedule() {
  const [tasks, setTasks] = useState(sampleTasks);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  const startEdit = (task) => {
    setEditingId(task.id);
    setDraft({ ...task });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveRow = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...draft } : t)));
    setEditingId(null);
    setDraft({});
  };

  const handleChange = (field, value) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const saveSchedule = async () => {
    const payload = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      start: t.start,
      end: t.end,
      duration: t.duration,
      assignee: t.assignee,
      dependency: t.dependency,
      status: t.status,
    }));
    // Replace with real API call
    console.log("Saving schedule payload ->", JSON.stringify(payload, null, 2));
    // Example: await fetch('/api/projects/123/schedule', { method:'POST', body:JSON.stringify(payload) })
    alert("Schedule saved (mock). Check console for payload.");
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Task Schedule & Dependencies</h2>
        <button
          onClick={saveSchedule}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
        >
          Save Schedule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Task ID</th>
              <th className="px-4 py-3">Task Name</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Dependency</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 align-top">{t.code}</td>

                <td className="px-4 py-3 align-top w-64">
                  {editingId === t.id ? (
                    <input
                      value={draft.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="font-medium">{t.name}</div>
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <input
                      type="date"
                      value={draft.start}
                      onChange={(e) => handleChange("start", e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    t.start
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <input
                      type="date"
                      value={draft.end}
                      onChange={(e) => handleChange("end", e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    t.end
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <input
                      type="number"
                      value={draft.duration}
                      onChange={(e) =>
                        handleChange("duration", Number(e.target.value))
                      }
                      className="w-20 border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    `${t.duration} days`
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <input
                      value={draft.assignee}
                      onChange={(e) => handleChange("assignee", e.target.value)}
                      className="w-40 border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    t.assignee
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <input
                      value={
                        Array.isArray(draft.dependency)
                          ? draft.dependency.join(",")
                          : draft.dependency || ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const deps = raw
                          ? raw
                              .split(",")
                              .map((s) => Number(s.replace(/[^0-9]/g, "")))
                          : null;
                        handleChange("dependency", deps);
                      }}
                      placeholder="e.g. 11 or 21,22"
                      className="w-32 border rounded px-2 py-1 text-sm"
                    />
                  ) : t.dependency ? (
                    Array.isArray(t.dependency) ? (
                      t.dependency.map((d) => `#${d}`).join(", ")
                    ) : (
                      `#${t.dependency}`
                    )
                  ) : (
                    "None"
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <select
                      value={draft.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  ) : (
                    <StatusBadge status={t.status} />
                  )}
                </td>

                <td className="px-4 py-3 align-top">
                  {editingId === t.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveRow(t.id)}
                        className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
