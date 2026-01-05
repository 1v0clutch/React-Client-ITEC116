import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

const ProjectForm = () => {
  const navigate = useNavigate();

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
  const [message, setMessage] = useState("");
  const [estimatedMaterialCost, setEstimatedMaterialCost] = useState(0);

  // Phase & Task handlers
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
    setEstimatedMaterialCost(0);
  };

  // Proceed to dependency setup page
  const handleNext = (e) => {
    e.preventDefault();

    const payload = {
      name: projectName,
      description: projectDescription,
      startDate: projectStart,
      endDate: projectEnd,
      phases,
      estimatedMaterialCost, // This will be 0 as materials are not added here
    };

    // Save temporarily to localStorage for next step
    localStorage.setItem("newProjectDraft", JSON.stringify(payload));

    setMessage("Proceeding to dependency setup...");
    setTimeout(() => {
      navigate("/project-management/dependencies-setup");
    }, 500);
  };

  return (
    <div className="w-full py-6 px-4">
      <div className="p-5 text-sm" style={{ overflowY: "auto" }}>
        <h2 className="text-center text-base font-semibold text-orange-600 mb-4">
          Project Setup — Step 1: Define Phases & Tasks
        </h2>

        {message && (
          <div className="p-2 mb-4 bg-gray-100 border rounded-sm">
            {message}
            <button
              onClick={() => setMessage("")}
              className="float-right text-red-600 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-4">
          {/* Project Details */}
          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Project Name
            </label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-2 py-1 border rounded-sm text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Brief project description"
              className="w-full px-2 py-1 border rounded-sm text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={projectStart}
                onChange={(e) => setProjectStart(e.target.value)}
                className="w-full px-2 py-1 border rounded-sm text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={projectEnd}
                onChange={(e) => setProjectEnd(e.target.value)}
                className="w-full px-2 py-1 border rounded-sm text-sm"
              />
            </div>
          </div>

          {/* Material cost notice */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-700">
                📋 Material Planning
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Material requirements will be added in the next step after setting
              up task dependencies.
            </p>
          </div>

          {/* Phases */}
          <h4 className="font-medium mt-3 mb-2 text-sm">Project Phases</h4>

          {phases.map((phase, pIndex) => (
            <section
              key={pIndex}
              className="border rounded p-3 bg-gray-50 space-y-2 text-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-700 mb-1">
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
                    className="bg-red-500 text-white px-3 py-1 rounded-sm text-xs"
                  >
                    Remove Phase
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 font-semibold">
                <div className="col-span-6">Task Name</div>
                <div className="col-span-3">Start</div>
                <div className="col-span-2">End</div>
                <div className="col-span-1 text-center">×</div>
              </div>

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
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </section>
          ))}

          <button
            type="button"
            onClick={addPhase}
            className="w-full bg-green-600 text-white px-3 py-2 rounded-sm text-sm"
          >
            Add Phase
          </button>

          {/* Controls */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-sm border text-sm"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-sm bg-blue-600 text-white text-sm"
            >
              Next: Assign Dependencies →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
