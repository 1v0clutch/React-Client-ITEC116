import React, { useState } from "react";

/*
  Work Breakdown Structure component with sample data ready for backend prep.
  - Expand/collapse phases
  - Add Phase / Add Task (client-side; hooks for backend calls included)
  - Progress bars and metadata shown
*/

const samplePhases = [
  {
    id: "phase-1",
    name: "Phase 1: Planning & Design",
    start: "2025-10-01",
    end: "2025-10-31",
    progress: 100,
    tasks: [
      {
        id: "t-1",
        name: "Requirements Gathering",
        start: "2025-10-03",
        end: "2025-10-09",
        durationDays: 7,
        assignee: "John Doe",
        dependency: null,
        progress: 100,
      },
      {
        id: "t-2",
        name: "Wireframe Creation",
        start: "2025-10-10",
        end: "2025-10-17",
        durationDays: 8,
        assignee: "Jane Smith",
        dependency: "t-1",
        progress: 100,
      },
      {
        id: "t-3",
        name: "UI/UX Design",
        start: "2025-10-18",
        end: "2025-10-31",
        durationDays: 14,
        assignee: "Bob Wilson",
        dependency: "t-2",
        progress: 100,
      },
    ],
  },
  {
    id: "phase-2",
    name: "Phase 2: Development",
    start: "2025-11-01",
    end: "2025-11-30",
    progress: 65,
    tasks: [
      {
        id: "t-4",
        name: "Frontend Development",
        start: "2025-11-02",
        end: "2025-11-20",
        durationDays: 19,
        assignee: "Frontend Team",
        dependency: null,
        progress: 80,
      },
      {
        id: "t-5",
        name: "Backend API Development",
        start: "2025-11-05",
        end: "2025-11-25",
        durationDays: 21,
        assignee: "Backend Team",
        dependency: null,
        progress: 70,
      },
      {
        id: "t-6",
        name: "Database Setup",
        start: "2025-11-08",
        end: "2025-11-12",
        durationDays: 5,
        assignee: "DB Admin",
        dependency: null,
        progress: 100,
      },
    ],
  },
  {
    id: "phase-3",
    name: "Phase 3: Testing & Deployment",
    start: "2025-12-01",
    end: "2025-12-31",
    progress: 20,
    tasks: [
      {
        id: "t-7",
        name: "QA Testing",
        start: "2025-12-05",
        end: "2025-12-15",
        durationDays: 11,
        assignee: "QA Team",
        dependency: "t-5",
        progress: 40,
      },
      {
        id: "t-8",
        name: "Bug Fixes",
        start: "2025-12-16",
        end: "2025-12-24",
        durationDays: 9,
        assignee: "Dev Team",
        dependency: "t-7",
        progress: 10,
      },
    ],
  },
];

function ProgressBar({ value = 0 }) {
  return (
    <div className="bg-gray-100 rounded-full h-3 w-full overflow-hidden">
      <div
        className="h-3 rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background:
            value === 100 ? "#10B981" : value >= 50 ? "#2563EB" : "#F59E0B",
        }}
      />
    </div>
  );
}

export default function WBS() {
  const [phases, setPhases] = useState(samplePhases);
  const [openPhase, setOpenPhase] = useState(phases[0]?.id || null);
  const [editMode, setEditMode] = useState(false); // header-level edit toggle

  const togglePhase = (id) => {
    setOpenPhase((prev) => (prev === id ? null : id));
  };

  // hooks for backend integration (replace fetch calls with your API)
  const addPhase = async () => {
    const newPhase = {
      id: `phase-${Date.now()}`,
      name: "New Phase",
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + 7 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
      progress: 0,
      tasks: [],
    };
    setPhases((p) => [...p, newPhase]);
    setOpenPhase(newPhase.id);
  };

  const addTask = (phaseId) => {
    const newTask = {
      id: `t-${Date.now()}`,
      name: "New Task",
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + 3 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
      durationDays: 3,
      assignee: "Unassigned",
      dependency: null,
      progress: 0,
    };
    setPhases((prev) =>
      prev.map((ph) =>
        ph.id === phaseId ? { ...ph, tasks: [...ph.tasks, newTask] } : ph
      )
    );
  };

  const removePhase = (id) => {
    setPhases((p) => p.filter((ph) => ph.id !== id));
    if (openPhase === id) setOpenPhase(null);
  };

  const removeTask = (phaseId, taskId) => {
    setPhases((prev) =>
      prev.map((ph) =>
        ph.id === phaseId
          ? { ...ph, tasks: ph.tasks.filter((t) => t.id !== taskId) }
          : ph
      )
    );
  };

  // new placeholders for edit actions
  const editPhase = (phaseId) => {
    console.log("Edit phase ->", phaseId);
    // open edit modal or populate form — implement as needed
    setOpenPhase(phaseId);
  };

  const editHeader = () => {
    setEditMode((v) => !v);
    console.log("Header edit mode:", !editMode);
  };

  // prepare payload to send to backend (called when saving)
  const getPayloadForBackend = () => {
    return phases.map((ph) => ({
      id: ph.id,
      name: ph.name,
      start: ph.start,
      end: ph.end,
      progress: ph.progress,
      tasks: ph.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        start: t.start,
        end: t.end,
        durationDays: t.durationDays,
        assignee: t.assignee,
        dependency: t.dependency,
        progress: t.progress,
      })),
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Work Breakdown Structure</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={addPhase}
            className="bg-white border border-gray-200 text-sm px-3 py-1 rounded-md hover:bg-gray-50"
            title="Add phase"
          >
            + Add Phase
          </button>

          {/* Removed Export JSON; replaced with Edit button */}
          <button
            onClick={editHeader}
            className={`text-sm px-3 py-1 rounded-md border ${
              editMode
                ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
            title="Toggle edit mode"
          >
            ✎ Edit
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => (
          <div key={phase.id} className="border rounded-md overflow-hidden">
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-xl text-gray-600">
                  {openPhase === phase.id ? "▾" : "▸"}
                </div>
                <div>
                  <div className="font-semibold">{phase.name}</div>
                  <div className="text-sm text-gray-500">
                    {phase.start} to {phase.end}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="w-28">
                  <ProgressBar value={phase.progress} />
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {phase.progress}%
                </div>

                <div className="flex items-center gap-2">
                  {/* changed from "+" to edit button for phase */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editPhase(phase.id);
                    }}
                    className="text-sm px-2 py-1 bg-white border rounded-md hover:bg-gray-50"
                    title="Edit phase"
                  >
                    ✎
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhase(phase.id);
                    }}
                    className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remove phase"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>

            {openPhase === phase.id && (
              <div className="p-4 bg-white">
                <div className="space-y-3">
                  {phase.tasks.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No tasks yet. Use + to add a task.
                    </div>
                  )}

                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-md p-3 bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {task.durationDays} days &nbsp;•&nbsp; Assignee:{" "}
                          {task.assignee} &nbsp;•&nbsp; Dependency:{" "}
                          {task.dependency || "None"}
                        </div>
                      </div>

                      <div className="w-1/3 flex items-center gap-3">
                        <div className="w-full">
                          <ProgressBar value={task.progress} />
                        </div>
                        <div className="text-sm w-12 text-right">
                          {task.progress}%
                        </div>
                        <button
                          onClick={() => removeTask(phase.id, task.id)}
                          className="text-red-500 text-sm px-2 py-1 rounded-md hover:bg-red-50"
                          title="Remove task"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}

                  <div
                    onClick={() => addTask(phase.id)}
                    className="mt-2 border-2 border-dashed border-gray-200 rounded-md py-3 text-center text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    + Add Task to {phase.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
