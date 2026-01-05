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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-teal-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-2 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Task Schedule & Dependencies</h3>
            <p className="text-sm text-gray-600">Manage task timelines and dependencies</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-6 py-3 text-sm rounded-xl border-2 font-semibold transition-all duration-300 ${
              editMode
                ? "bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700 hover:border-teal-300"
            }`}
          >
            <FiEdit2 className="w-4 h-4" /> {editMode ? "Editing" : "Edit"}
          </button>

          <button
            onClick={saveSchedule}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <FiSave className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-teal-500 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
          </svg>
          <p className="text-lg font-semibold text-gray-500">No tasks found for this project</p>
          <p className="text-gray-400 mt-2">Add tasks to your project to manage schedules</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b-2 border-teal-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    #
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-96">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                    </svg>
                    Task Name
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-40">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Phase
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-32">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Start
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-32">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    End
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-48">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assignee
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700 w-60">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Dependencies
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => {
                const depNames = getDependencyNames(t.dependencies);

                return (
                  <tr key={t.numId} className="border-b border-gray-100 hover:bg-teal-50 transition-colors duration-200">
                    <td className="py-4 px-4">
                      <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t.numId}
                      </span>
                    </td>

                    {/* Enhanced Task Name Field */}
                    <td className="py-4 px-4">
                      {editMode ? (
                        <textarea
                          rows={2}
                          value={t.name}
                          onChange={(e) =>
                            handleChange(t.numId, "name", e.target.value)
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                      ) : (
                        <div className="font-semibold text-gray-800">{t.name}</div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {t.phase}
                      </span>
                    </td>

                    {/* Enhanced Start Date */}
                    <td className="py-4 px-4">
                      {editMode ? (
                        <input
                          type="date"
                          value={t.start}
                          onChange={(e) =>
                            handleChange(t.numId, "start", e.target.value)
                          }
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                      ) : (
                        <span className="text-gray-700 font-medium">{t.start}</span>
                      )}
                    </td>

                    {/* Enhanced End Date */}
                    <td className="py-4 px-4">
                      {editMode ? (
                        <input
                          type="date"
                          value={t.end}
                          onChange={(e) =>
                            handleChange(t.numId, "end", e.target.value)
                          }
                          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                      ) : (
                        <span className="text-gray-700 font-medium">{t.end}</span>
                      )}
                    </td>

                    {/* Enhanced Assignee */}
                    <td className="py-4 px-4">
                      {editMode ? (
                        <input
                          value={t.assignee}
                          onChange={(e) =>
                            handleChange(t.numId, "assignee", e.target.value)
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter assignee name"
                        />
                      ) : (
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          {t.assignee}
                        </span>
                      )}
                    </td>

                    {/* Enhanced Dependencies */}
                    <td className="py-4 px-4">
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
                          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                      ) : depNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {depNames.map((dep, idx) => (
                            <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                              {dep}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
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
