import React, { useEffect, useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

const API_PROJECT = "http://localhost:8000/api/project";

export default function ProjectGantt({
  project: propProject = null,
  projectId = null,
}) {
  const [project, setProject] = useState(propProject);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(ViewMode.Week);

  useEffect(() => {
    setProject(propProject);
  }, [propProject]);

  useEffect(() => {
    let mounted = true;
    const fetchProject = async () => {
      setLoading(true);
      try {
        let data = propProject;
        if (!data) {
          if (projectId) {
            const res = await fetch(`${API_PROJECT}/gantt/${projectId}`);
            if (!res.ok) throw new Error("Failed to fetch project");
            data = await res.json();
          } else {
            const res = await fetch(`${API_PROJECT}/projects`);
            if (!res.ok) throw new Error("Failed to fetch projects list");
            const arr = await res.json();
            data = Array.isArray(arr) ? arr[0] : arr;
          }
        }
        if (mounted) setProject(data || null);
      } catch (err) {
        console.error("ProjectGantt: fetch error", err);
        if (mounted) setProject(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (!propProject) fetchProject();
    return () => {
      mounted = false;
    };
  }, [propProject, projectId]);

  useEffect(() => {
    if (!project || !project.phases) {
      setTasks([]);
      return;
    }

    const toDate = (d) => {
      if (!d) return null;
      const dt = new Date(d);
      return isNaN(dt) ? null : dt;
    };

    const builtTasks = [];
    (project.phases || []).forEach((phase, pIdx) => {
      const taskStarts = (phase.tasks || [])
        .map((t) => toDate(t.startDate))
        .filter(Boolean);
      const taskEnds = (phase.tasks || [])
        .map((t) => toDate(t.endDate))
        .filter(Boolean);

      const phaseStart =
        toDate(phase.startDate) ||
        (taskStarts.length
          ? new Date(Math.min(...taskStarts.map((d) => d.getTime())))
          : null);
      const phaseEnd =
        toDate(phase.endDate) ||
        (taskEnds.length
          ? new Date(Math.max(...taskEnds.map((d) => d.getTime())))
          : null);

      const phaseId = String(phase._id ?? `phase-${pIdx + 1}`);

      if (phaseStart && phaseEnd) {
        builtTasks.push({
          id: phaseId,
          name: phase.name || `Phase ${pIdx + 1}`,
          start: phaseStart,
          end: phaseEnd,
          type: "project",
          progress: Number(phase.progress ?? 0),
        });
      }

      (phase.tasks || []).forEach((t, tIdx) => {
        const taskId = String(t._id ?? `${phaseId}-t${tIdx + 1}`);
        let start = toDate(t.startDate);
        let end = toDate(t.endDate);

        if (!end && start && t.durationDays) {
          end = new Date(start);
          end.setDate(end.getDate() + Number(t.durationDays));
        }

        if (!start && end && t.durationDays) {
          start = new Date(end);
          start.setDate(start.getDate() - Number(t.durationDays));
        }

        if (start && !end) {
          end = new Date(start);
          end.setDate(end.getDate() + 1);
        }

        if (!start || !end) return; // Skip invalid task

        builtTasks.push({
          id: taskId,
          name: t.name || `Task ${tIdx + 1}`,
          start,
          end,
          type: "task",
          progress: Number(t.progress ?? 0),
          project: phaseId,
          dependencies: (t.dependencies || []).map(String),
        });
      });
    });

    setTasks(builtTasks);
  }, [project]);

  if (loading) return <div className="p-6">Loading Gantt...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {project?.name || "Project Timeline"}
        </h1>
        <div className="flex items-center gap-2">
          {["Day", "Week", "Month"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(ViewMode[mode])}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {tasks.length > 0 ? (
        <Gantt tasks={tasks} viewMode={viewMode} />
      ) : (
        <p className="text-gray-500">No tasks to display.</p>
      )}
    </div>
  );
}
