import React, { useMemo, useState, useEffect } from "react";
import ProjectGantt from "./ProjectGantt";
import { useNavigate } from "react-router-dom"; //

const API_PROJECT = "http://localhost:8000/api/project";

function SmallStat({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border-2 border-gray-100 hover:border-teal-200 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-600 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-3 shadow-lg">
          <div className="text-2xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value, colorClass = "bg-gradient-to-r from-green-500 to-emerald-600" }) {
  const pct = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out shadow-sm`}
        style={{ width: `${pct}%` }}
        aria-hidden
      />
    </div>
  );
}

/*
  Overview
  Props:
    - project: optional full project object
    - projectId: optional project id string (used if `project` not provided)
  If neither provided, component shows empty state.
*/
export default function Overview({
  project: propProject = null,
  projectId = null,
}) {
  const navigate = useNavigate(); // <--- added
  const [project, setProject] = useState(propProject);
  const [loading, setLoading] = useState(false);

  // keep local project in sync when parent passes a new project
  useEffect(() => {
    setProject(propProject);
  }, [propProject]);

  // fetch when project not provided but projectId is
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

    if (!propProject && projectId) fetchProject(projectId);
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
    <div className="space-y-8">
      {/* Enhanced Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Enhanced Timeline Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border-2 border-gray-100 hover:border-teal-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-2 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Project Timeline</h3>
              <p className="text-sm text-gray-600">Track task progress and dependencies</p>
            </div>
          </div>
          <button
            type="button"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            onClick={() => {
              const id = project?._id ?? project?.id ?? projectId;
              if (id) navigate(`/project-management/gantt/${id}`);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Full Gantt
          </button>
        </div>

        <div className="space-y-6">
          {timelineTasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-gray-500">No tasks to display</p>
              <p className="text-gray-400 mt-2">Add tasks to your project to see the timeline</p>
            </div>
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
