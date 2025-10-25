import React, { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiX,
} from "react-icons/fi";

const API_PROJECT = "http://localhost:8000/api/project";

function ProgressBar({ value = 0 }) {
  return (
    <div className="bg-gray-100 rounded-full h-3 w-full overflow-hidden">
      <div
        className="h-3 rounded-full transition-all"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background:
            value === 100 ? "#10B981" : value >= 50 ? "#2563EB" : "#F59E0B",
        }}
      />
    </div>
  );
}

function formatDate(raw) {
  if (!raw) return "";
  // raw may be a Date object or an ISO string; normalize to YYYY-MM-DD
  try {
    const d = raw instanceof Date ? raw : new Date(raw);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

// compute phase start/end from tasks (earliest start, latest end), returns { start, end }
function getPhaseRange(phase) {
  if (!phase || !Array.isArray(phase.tasks) || phase.tasks.length === 0)
    return { start: null, end: null };

  const starts = phase.tasks
    .map((t) => formatDate(t.startDate))
    .filter(Boolean);
  const ends = phase.tasks.map((t) => formatDate(t.endDate)).filter(Boolean);

  if (starts.length === 0 && ends.length === 0)
    return { start: null, end: null };

  const minStart = starts.length ? starts.sort()[0] : null;
  const maxEnd = ends.length ? ends.sort().reverse()[0] : null;
  return { start: minStart, end: maxEnd };
}

export default function WBS({ project, projectId }) {
  const [projectData, setProjectData] = useState(project || null);
  const [phases, setPhases] = useState(project?.phases || []);
  const [openPhase, setOpenPhase] = useState(phases[0]?._id || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "phase" | "task"
  const [modalPhaseId, setModalPhaseId] = useState(null);
  const [form, setForm] = useState({ name: "", startDate: "", endDate: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (project) {
      setProjectData(project);
      setPhases(project.phases || []);
      setOpenPhase(project.phases?.[0]?._id || null);
    } else if (projectId) {
      fetchProject(projectId);
    }
  }, [project, projectId]);

  const fetchProject = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_PROJECT}/projects/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch project");
      setProjectData(data);
      // normalize tasks' date strings to YYYY-MM-DD in local state
      const normalizedPhases = (data.phases || []).map((ph) => ({
        ...ph,
        tasks: (ph.tasks || []).map((t) => ({
          ...t,
          startDate: formatDate(t.startDate),
          endDate: formatDate(t.endDate),
        })),
      }));
      setPhases(normalizedPhases);
      setOpenPhase(normalizedPhases?.[0]?._id || null);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (type, phaseId = null) => {
    setModalType(type);
    setModalPhaseId(phaseId || null);
    // default task dates: today and +3
    const today = new Date();
    const plus3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    setForm({
      name: "",
      startDate: formatDate(today),
      endDate: formatDate(plus3),
    });
    setShowModal(true);
  };

  const saveModal = () => {
    if (!form.name.trim()) {
      alert("Please enter a name.");
      return;
    }

    if (modalType === "phase") {
      const newPhase = {
        _id: `phase-${Date.now()}`,
        name: form.name.trim(),
        progress: 0,
        tasks: [],
      };
      setPhases((prev) => [...prev, newPhase]);
      setOpenPhase(newPhase._id);
    }

    if (modalType === "task" && modalPhaseId) {
      const newTask = {
        _id: `task-${Date.now()}`,
        name: form.name.trim(),
        startDate: form.startDate ? formatDate(form.startDate) : "",
        endDate: form.endDate ? formatDate(form.endDate) : "",
        durationDays:
          form.startDate && form.endDate
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(form.endDate) - new Date(form.startDate)) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 0,
        assignee: "Unassigned",
        progress: 0,
        dependencies: [],
      };
      setPhases((prev) =>
        prev.map((p) =>
          p._id === modalPhaseId ? { ...p, tasks: [...p.tasks, newTask] } : p
        )
      );
      setOpenPhase(modalPhaseId);
    }

    setShowModal(false);
  };

  const toggleEditMode = () => setEditMode((v) => !v);

  const removePhase = (id) => {
    setPhases((prev) => prev.filter((ph) => ph._id !== id));
    if (openPhase === id) setOpenPhase(null);
  };

  const removeTask = (phaseId, taskId) => {
    setPhases((prev) =>
      prev.map((ph) =>
        ph._id === phaseId
          ? { ...ph, tasks: ph.tasks.filter((t) => t._id !== taskId) }
          : ph
      )
    );
  };

  const editTaskField = (phaseId, taskId, field, value) => {
    setPhases((prev) =>
      prev.map((p) =>
        p._id === phaseId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t._id === taskId ? { ...t, [field]: value } : t
              ),
            }
          : p
      )
    );
  };

  // update existing project (PUT)
  const saveToDatabase = async () => {
    if (!projectData?._id) {
      alert("No project selected to update.");
      return;
    }

    try {
      // build payload; phase start/end intentionally omitted (backend pre-save will compute from tasks)
      const payload = {
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        status: projectData.status || "Planned",
        phases: phases.map((ph) => ({
          name: ph.name,
          progress: ph.progress || 0,
          tasks: (ph.tasks || []).map((t) => ({
            _id: t._id && String(t._id).startsWith("task-") ? undefined : t._id, // allow backend to keep/generate _id
            name: t.name,
            startDate: t.startDate || null,
            endDate: t.endDate || null,
            durationDays: t.durationDays || 0,
            assignee: t.assignee === "Unassigned" ? null : t.assignee,
            progress: t.progress || 0,
            dependencies: t.dependencies || [],
          })),
        })),
      };

      const res = await fetch(`${API_PROJECT}/projects/${projectData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update project");

      // normalize returned dates for UI
      const normalizedPhases = (data.phases || []).map((ph) => ({
        ...ph,
        tasks: (ph.tasks || []).map((t) => ({
          ...t,
          startDate: formatDate(t.startDate),
          endDate: formatDate(t.endDate),
        })),
      }));

      setProjectData(data);
      setPhases(normalizedPhases);
      setEditMode(false);
      alert("Project updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + err.message);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading WBS...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Work Breakdown Structure — {projectData?.name || "Untitled Project"}
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal("phase")}
            className="flex items-center gap-2 bg-white border border-gray-200 text-sm px-3 py-1 rounded-md hover:bg-gray-50"
            title="Add Phase"
          >
            <FiPlus /> Add Phase
          </button>

          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md border ${
              editMode
                ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
            title="Toggle edit mode"
          >
            <FiEdit2 /> {editMode ? "Editing" : "Edit"}
          </button>

          <button
            onClick={saveToDatabase}
            className="flex items-center gap-2 bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700"
            title="Update project"
          >
            <FiSave /> Update Project
          </button>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.length === 0 ? (
          <div className="text-gray-500 text-sm">No phases yet.</div>
        ) : (
          phases.map((phase) => {
            const range = getPhaseRange(phase);
            return (
              <div
                key={phase._id}
                className="border rounded-md overflow-hidden"
              >
                <div
                  className="flex justify-between items-center bg-gray-50 p-4"
                  // header click toggles open
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() =>
                      setOpenPhase((prev) =>
                        prev === phase._id ? null : phase._id
                      )
                    }
                  >
                    {openPhase === phase._id ? (
                      <FiChevronDown className="text-gray-500" />
                    ) : (
                      <FiChevronRight className="text-gray-500" />
                    )}

                    <div>
                      <div className="font-semibold">{phase.name}</div>
                      <div className="text-sm text-gray-500">
                        {range.start
                          ? `${range.start} → ${range.end || "—"}`
                          : "No tasks yet"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <ProgressBar value={phase.progress || 0} />
                    </div>

                    {/* Add Task visible on the header (always) */}
                    <button
                      onClick={() => openAddModal("task", phase._id)}
                      className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md text-sm hover:bg-gray-50"
                      title={`Add task to ${phase.name}`}
                    >
                      <FiPlus />
                    </button>

                    {editMode && (
                      <button
                        onClick={() => removePhase(phase._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove phase"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>

                {openPhase === phase._id && (
                  <div className="p-4 space-y-3">
                    {(phase.tasks || []).length === 0 ? (
                      <div className="text-sm text-gray-500">No tasks yet.</div>
                    ) : (
                      (phase.tasks || []).map((task) => (
                        <div
                          key={task._id}
                          className="border rounded-md p-3 bg-gray-50 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            {editMode ? (
                              <input
                                value={task.name}
                                onChange={(e) =>
                                  editTaskField(
                                    phase._id,
                                    task._id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="font-medium bg-transparent border-b border-dashed w-full"
                              />
                            ) : (
                              <div className="font-medium">{task.name}</div>
                            )}
                            <div className="text-sm text-gray-500">
                              {formatDate(task.startDate)} →{" "}
                              {formatDate(task.endDate)}
                            </div>
                          </div>

                          <div className="w-1/3 flex items-center gap-3">
                            <ProgressBar value={task.progress || 0} />
                            {editMode && (
                              <button
                                onClick={() => removeTask(phase._id, task._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove task"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {editMode && (
                      <div
                        onClick={() => openAddModal("task", phase._id)}
                        className="mt-2 border-2 border-dashed border-gray-200 rounded-md py-3 text-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="inline-flex items-center gap-2 justify-center">
                          <FiPlus /> Add Task to {phase.name}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {modalType === "phase" ? "Add New Phase" : "Add New Task"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder={modalType === "phase" ? "Phase name" : "Task name"}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />

              {modalType === "task" && (
                <>
                  <label className="block text-sm text-gray-600">
                    Start Date:
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm({ ...form, startDate: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    />
                  </label>

                  <label className="block text-sm text-gray-600">
                    End Date:
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 text-sm mt-1"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm"
              >
                <FiX /> Cancel
              </button>
              <button
                onClick={saveModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                <FiSave /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
