import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

export default function DependencySetup() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const draft = localStorage.getItem("newProjectDraft");
    if (!draft) {
      setMessage("⚠️ No project draft found. Please create a project first.");
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(draft);

    // Flatten tasks for easy dependency assignment
    let counter = 1;
    const allTasks = [];
    parsed.phases.forEach((phase, pIndex) => {
      phase.tasks.forEach((task, tIndex) => {
        task._uid = counter++;
        task.phaseIndex = pIndex;
        task.taskIndex = tIndex;
        task.dependencies = []; // default empty
        allTasks.push(task);
      });
    });

    setProject({ ...parsed, allTasks });
    setLoading(false);
  }, []);

  const handleDependencyChange = (taskUid, selectedIds) => {
    setProject((prev) => {
      const updatedTasks = prev.allTasks.map((task) =>
        task._uid === taskUid ? { ...task, dependencies: selectedIds } : task
      );

      // Update inside phases too
      const updatedPhases = prev.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((t) => {
          const updated = updatedTasks.find((x) => x._uid === t._uid);
          return updated || t;
        }),
      }));

      return { ...prev, allTasks: updatedTasks, phases: updatedPhases };
    });
  };

  const saveToDatabase = async () => {
    try {
      const response = await fetch(`${API_PROJECT}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ Project successfully saved!");
        localStorage.removeItem("newProjectDraft");
        setTimeout(() => navigate("/project-management"), 1000);
      } else {
        setMessage(`❌ Save failed: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading project…</div>
    );

  if (!project)
    return (
      <div className="p-6 text-center text-red-600">
        No project draft found. Go back to Project Form.
      </div>
    );

  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-orange-600 mb-4">
        Step 2: Assign Task Dependencies
      </h2>

      {message && (
        <div className="p-3 mb-4 border rounded bg-gray-50 text-sm">
          {message}
          <button
            onClick={() => setMessage("")}
            className="float-right text-red-600 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Project Summary */}
      <div className="border p-4 rounded bg-gray-50 mb-6">
        <div>
          <strong>Project:</strong> {project.name}
        </div>
        <div className="text-sm text-gray-600">
          {project.startDate} → {project.endDate}
        </div>
        <div className="text-sm">{project.description}</div>
      </div>

      {/* Dependencies Table */}
      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Task Name</th>
              <th className="px-4 py-2 text-left">Phase</th>
              <th className="px-4 py-2 text-left">Dependencies</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
            </tr>
          </thead>
          <tbody>
            {project.allTasks.map((task) => (
              <tr key={task._uid} className="border-t">
                <td className="px-4 py-2 text-gray-500">{`#${task._uid}`}</td>
                <td className="px-4 py-2">{task.name}</td>
                <td className="px-4 py-2">
                  {project.phases[task.phaseIndex]?.name}
                </td>
                <td className="px-4 py-2">
                  <select
                    multiple
                    value={task.dependencies}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(
                        (o) => Number(o.value)
                      );
                      handleDependencyChange(task._uid, values);
                    }}
                    className="border rounded px-2 py-1 text-sm w-full"
                  >
                    <option value="">(none)</option>
                    {project.allTasks
                      .filter((t) => t._uid !== task._uid)
                      .map((t) => (
                        <option key={t._uid} value={t._uid}>
                          #{t._uid} {t.name}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="px-4 py-2">{task.start}</td>
                <td className="px-4 py-2">{task.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Buttons */}
      <div className="flex justify-end mt-6 gap-3">
        <button
          onClick={() => navigate("/project-management")}
          className="border px-4 py-2 rounded text-sm"
        >
          ← Back
        </button>
        <button
          onClick={saveToDatabase}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Save Project to Database
        </button>
      </div>
    </div>
  );
}
