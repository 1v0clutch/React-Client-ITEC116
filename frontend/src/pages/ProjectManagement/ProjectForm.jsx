import React, { useState } from "react";

const ProjectForm = ({ onSave }) => {
  const emptyTask = () => ({ name: "", start: "", end: "" });
  const emptyPhase = () => ({
    name: "",
    start: "",
    end: "",
    tasks: [emptyTask()],
  });

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [projectEnd, setProjectEnd] = useState("");
  const [phases, setPhases] = useState([emptyPhase()]);

  const updatePhaseField = (pIndex, field, value) =>
    setPhases((prev) =>
      prev.map((p, i) => (i === pIndex ? { ...p, [field]: value } : p))
    );

  const addPhase = () => setPhases((prev) => [...prev, emptyPhase()]);
  const removePhase = (idx) =>
    setPhases((prev) => prev.filter((_, i) => i !== idx));

  const addTask = (pIndex) =>
    setPhases((prev) =>
      prev.map((p, i) =>
        i === pIndex ? { ...p, tasks: [...p.tasks, emptyTask()] } : p
      )
    );

  const removeTask = (pIndex, tIndex) =>
    setPhases((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? { ...p, tasks: p.tasks.filter((_, ti) => ti !== tIndex) }
          : p
      )
    );

  const updateTaskField = (pIndex, tIndex, field, value) =>
    setPhases((prev) =>
      prev.map((p, i) =>
        i === pIndex
          ? {
              ...p,
              tasks: p.tasks.map((t, ti) =>
                ti === tIndex ? { ...t, [field]: value } : t
              ),
            }
          : p
      )
    );

  const resetForm = () => {
    setProjectName("");
    setProjectDescription("");
    setProjectStart("");
    setProjectEnd("");
    setPhases([emptyPhase()]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: projectName,
      description: projectDescription,
      start: projectStart,
      end: projectEnd,
      phases,
    };
    if (typeof onSave === "function") onSave(payload);
    else console.log("Saving project:", payload);
  };

  return (
    <div className="w-full py-6 px-4">
      <div className="p-5 text-sm" style={{ overflowY: "auto" }}>
        <h2 className="text-center text-base font-semibold text-orange-600 mb-4">
          Define Project Timelines and Phases
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label
              htmlFor="projectName"
              className="block text-gray-700 mb-1 text-xs"
            >
              Project Name
            </label>
            <input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-2 py-1 border rounded-sm text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="projectDescription"
              className="block text-gray-700 mb-1 text-xs"
            >
              Description
            </label>
            <textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief description of project"
              className="w-full px-2 py-1 border rounded-sm text-sm"
              rows={3}
            />
          </div>

          {/* Project start/end */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="projectStart"
                className="block text-gray-700 mb-1 text-xs"
              >
                Start Date
              </label>
              <input
                id="projectStart"
                type="date"
                value={projectStart}
                onChange={(e) => setProjectStart(e.target.value)}
                className="w-full px-2 py-1 border rounded-sm text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="projectEnd"
                className="block text-gray-700 mb-1 text-xs"
              >
                End Date
              </label>
              <input
                id="projectEnd"
                type="date"
                value={projectEnd}
                onChange={(e) => setProjectEnd(e.target.value)}
                className="w-full px-2 py-1 border rounded-sm text-sm"
              />
            </div>
          </div>

          {/* Phases header */}
          <div>
            <h4 className="font-medium mt-1 mb-2 text-sm">Project Phases</h4>
          </div>

          {/* Phases list */}
          {phases.map((phase, pIndex) => (
            <section
              key={pIndex}
              className="border rounded p-3 bg-gray-50 space-y-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="block text-gray-700 mb-1 text-xs">
                    Phase Name
                  </label>
                  <input
                    value={phase.name}
                    onChange={(e) =>
                      updatePhaseField(pIndex, "name", e.target.value)
                    }
                    placeholder="Phase name"
                    className="w-full px-2 py-1 border rounded-sm text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 ml-3">
                  <button
                    type="button"
                    onClick={() => addTask(pIndex)}
                    className="bg-orange-500 text-white px-3 py-1 rounded-sm text-xs"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhase(pIndex)}
                    className="bg-red-400 text-white px-3 py-1 rounded-sm text-xs"
                  >
                    Remove Phase
                  </button>
                </div>
              </div>

              {/* Task labels */}
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600">
                <div className="col-span-6">Task Name</div>
                <div className="col-span-3">Start Date</div>
                <div className="col-span-2">End Date</div>
                <div className="col-span-1" />
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {phase.tasks.map((task, tIndex) => (
                  <div
                    key={tIndex}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      value={task.name}
                      onChange={(e) =>
                        updateTaskField(pIndex, tIndex, "name", e.target.value)
                      }
                      placeholder="Task name"
                      className="col-span-6 px-2 py-1 border rounded-sm text-sm"
                      required
                    />
                    <input
                      type="date"
                      value={task.start}
                      onChange={(e) =>
                        updateTaskField(pIndex, tIndex, "start", e.target.value)
                      }
                      className="col-span-3 px-2 py-1 border rounded-sm text-sm"
                    />
                    <input
                      type="date"
                      value={task.end}
                      onChange={(e) =>
                        updateTaskField(pIndex, tIndex, "end", e.target.value)
                      }
                      className="col-span-2 px-2 py-1 border rounded-sm text-sm"
                    />
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeTask(pIndex, tIndex)}
                        className="bg-red-400 text-white w-6 h-6 rounded-sm text-xs flex items-center justify-center"
                        aria-label="Remove task"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div>
            <button
              type="button"
              onClick={addPhase}
              className="w-full bg-green-600 text-white px-3 py-2 rounded-sm text-sm"
            >
              Add Phase
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-sm border text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-sm bg-blue-600 text-white text-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
