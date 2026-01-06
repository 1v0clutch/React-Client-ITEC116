import React, { useEffect, useState } from "react";
import { FiEdit2, FiSave } from "react-icons/fi";

const API_PROJECT = "http://localhost:8000/api/project";

export default function TaskSchedule({ project }) {
  const [tasks, setTasks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project?._id) {
      fetchProjectTasks(project._id);
    } else {
      setTasks([]);
    }
  }, [project]);

  const fetchProjectTasks = async (projectId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_PROJECT}/projects/${projectId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch project");

      const allTasks = [];
      let counter = 1;

      (data.phases || []).forEach((phase) => {
        (phase.tasks || []).forEach((t) => {
          allTasks.push({
            numId: counter++,
            dbId: t._id,
            name: t.name,
            phase: phase.name,
            start: t.startDate?.slice(0, 10) || "",
            end: t.endDate?.slice(0, 10) || "",
            assignee: t.assignee || "Unassigned",
            dependencies: t.dependencies || [],
          });
        });
      });

      setTasks(allTasks);
    } catch (err) {
      console.error("Error fetching project tasks:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (numId, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t.numId === numId ? { ...t, [field]: value } : t))
    );
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const saveSchedule = async () => {
    try {
      const payload = {
        tasks: tasks.map((t) => ({
          dbId: t.dbId,
          name: t.name,
          startDate: t.start,
          endDate: t.end,
          assignee: t.assignee,
          dependencies: t.dependencies,
        })),
      };

      const res = await fetch(`${API_PROJECT}/projects/${project._id}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update project");

      alert("Project tasks updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert(`Save failed: ${err.message}`);
    }
  };

  const getDependencyNames = (depIds) => {
    if (!depIds || depIds.length === 0) return [];
    const mapByDbId = new Map(tasks.map((t) => [t.dbId, t.name]));
    return depIds.map((id) => mapByDbId.get(id) || id).filter((n) => !!n);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Task Schedule & Dependencies</h2>

        <div className="flex gap-3">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md border ${
              editMode
                ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FiEdit2 /> {editMode ? "Editing" : "Edit"}
          </button>

          <button
            onClick={saveSchedule}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            <FiSave /> Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No tasks found for this project.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 w-96">Task Name</th>
                <th className="px-4 py-3 w-40">Phase</th>
                <th className="px-4 py-3 w-32">Start</th>
                <th className="px-4 py-3 w-32">End</th>
                <th className="px-4 py-3 w-48">Assignee</th>
                <th className="px-4 py-3 w-60">Dependencies</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => {
                const depNames = getDependencyNames(t.dependencies);

                return (
                  <tr key={t.numId} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {t.numId}
                    </td>

                    {/* Expanded Task Name Field */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <textarea
                          rows={2}
                          value={t.name}
                          onChange={(e) =>
                            handleChange(t.numId, "name", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1 text-sm resize-none"
                        />
                      ) : (
                        <div className="font-medium">{t.name}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-gray-500">{t.phase}</td>

                    {/* Start Date */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <input
                          type="date"
                          value={t.start}
                          onChange={(e) =>
                            handleChange(t.numId, "start", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        t.start
                      )}
                    </td>

                    {/* End Date */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <input
                          type="date"
                          value={t.end}
                          onChange={(e) =>
                            handleChange(t.numId, "end", e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        t.end
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <input
                          value={t.assignee}
                          onChange={(e) =>
                            handleChange(t.numId, "assignee", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        t.assignee
                      )}
                    </td>

                    {/* Dependencies */}
                    <td className="px-4 py-3">
                      {editMode ? (
                        <input
                          value={t.dependencies.join(",")}
                          onChange={(e) =>
                            handleChange(
                              t.numId,
                              "dependencies",
                              e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Comma-separated task IDs"
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      ) : depNames.length > 0 ? (
                        depNames.join(", ")
                      ) : (
                        "None"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
