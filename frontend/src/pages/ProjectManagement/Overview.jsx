import React, { useMemo, useState, useEffect } from "react";
import ProjectGantt from "./ProjectGantt";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

function SmallStat({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="mt-1 font-semibold text-lg">{value}</div>
      </div>
      <div className="text-2xl text-gray-300">{icon}</div>
    </div>
  );
}

function ProgressBar({ value, colorClass = "bg-green-500" }) {
  const pct = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div
        className={`${colorClass} h-full`}
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  );
}

export default function Overview({
  project: propProject = null,
  projectId = null,
}) {
  const navigate = useNavigate();
  const [project, setProject] = useState(propProject);
  const [loading, setLoading] = useState(false);

  // Reset project when propProject changes
  useEffect(() => {
    setProject(propProject);
  }, [propProject]);

  // Fetch project data when needed
  useEffect(() => {
    let mounted = true;
    const fetchProject = async (id) => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_PROJECT}/${id}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (mounted) setProject(data);
      } catch (err) {
        console.error("Overview: failed to fetch project", err);
        if (mounted) setProject(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Only fetch if we don't have a project but we have a projectId
    if (!propProject && projectId) {
      fetchProject(projectId);
    }
    return () => {
      mounted = false;
    };
  }, [propProject, projectId]);

  const stats = useMemo(() => {
    if (!project) {
      return {
        progress: 0,
        budgetUsed: null,
        teamSize: 0,
        daysRemaining: null,
      };
    }

    let progress = 0;
    if (Array.isArray(project.phases) && project.phases.length > 0) {
      const vals = project.phases.map((p) => Number(p.progress || 0));
      progress = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    } else {
      progress = Math.round(project.progress || 0);
    }

    const budgetUsed =
      project.budgetUsed ??
      project.budget?.used ??
      project.budget?.spent ??
      null;
    const teamSize = Array.isArray(project.team) ? project.team.length : 0;

    let daysRemaining = null;
    if (project.endDate) {
      const today = new Date();
      const end = new Date(project.endDate);
      const diffMs = end.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return { progress, budgetUsed, teamSize, daysRemaining };
  }, [project]);

  const timelineTasks = useMemo(() => {
    if (!project || !Array.isArray(project.phases)) return [];
    const tasks = project.phases.flatMap((phase) =>
      (phase.tasks || []).map((t) => ({ ...t, phaseName: phase.name }))
    );
    tasks.sort((a, b) => {
      const as = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const bs = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return as - bs;
    });
    return tasks;
  }, [project]);

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (isNaN(dt)) return "—";
    return dt.toISOString().slice(0, 10);
  };

  const shortCode = (id, idx) => {
    if (!id) return `#${idx + 1}`;
    const s = String(id);
    return "#" + s.slice(-6);
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading project...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SmallStat title="Progress" value={`${stats.progress}%`} icon="📈" />
        <SmallStat
          title="Budget Used"
          value={
            stats.budgetUsed != null ? `$${String(stats.budgetUsed)}` : "—"
          }
          icon="💲"
        />
        <SmallStat title="Team Size" value={stats.teamSize} icon="👥" />
        <SmallStat
          title="Days Remaining"
          value={stats.daysRemaining != null ? `${stats.daysRemaining}` : "—"}
          icon="⏳"
        />
      </div>

      {/* Gantt Chart Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Project Gantt Chart</div>
          {/* <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
              const id = project?._id ?? project?.id;
              if (id) navigate(`/project-management/gantt/${id}`);
            }}
          >
            View Full Gantt
          </button> */}
        </div>
        <ProjectGantt project={project} />
      </div>

      {/* Timeline card */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Project Timeline</div>
        </div>

        <div className="space-y-4">
          {timelineTasks.length === 0 ? (
            <div className="text-sm text-gray-500">No tasks to display.</div>
          ) : (
            timelineTasks.map((t, i) => {
              const status = t.status || "Not Started";
              const color =
                status === "Completed"
                  ? "bg-green-500"
                  : status === "In Progress"
                  ? "bg-blue-500"
                  : "bg-gray-400";
              const depText =
                Array.isArray(t.dependencies) && t.dependencies.length > 0
                  ? ` (depends on: ${t.dependencies
                      .map((d, idx) => shortCode(d, idx))
                      .join(", ")})`
                  : "";

              return (
                <div key={t._id ?? `${i}`} className="flex items-center gap-4">
                  <div className="w-3">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${color}`}
                      title={status}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {t.name}
                        <span className="text-xs text-gray-400 ml-2">
                          {depText}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        {formatDate(t.startDate)} - {formatDate(t.endDate)}{" "}
                        <span className="ml-4 font-medium">
                          {(t.progress ?? 0) + "%"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <ProgressBar value={t.progress ?? 0} colorClass={color} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
