import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import Overview from "./Overview";
import WorkBreakdown from "./WorkBreakdowns";
import TaskSchedule from "./TaskSchedule";
import { FiPlus, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

function Project() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("gantt"); // Track active tab
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const id = selectedId || projects[0]._id || projects[0].id;
      setSelectedId(id);
      const found = projects.find((p) => p._id === id || p.id === id);
      setSelectedProject(found || null);
    } else {
      setSelectedProject(null);
      setSelectedId(null);
    }
  }, [projects, selectedId]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API_PROJECT}/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const computeProgress = (project) => {
    if (!project) return 0;
    if (Array.isArray(project.phases) && project.phases.length > 0) {
      const vals = project.phases.map((p) => Number(p.progress || 0));
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      return avg;
    }
    return Math.round(project.progress || 0);
  };

  // Render content based on active tab and pass selected project
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview project={selectedProject} />;
      case "wbs":
        return <WorkBreakdown project={selectedProject} />;
      case "dependencies":
        return <TaskSchedule project={selectedProject} />;
      case "resources":
        return <TaskSchedule project={selectedProject} />; // replace with real Resources component if available
      default:
        return <Overview project={selectedProject} />;
    }
  };

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Management
          </h1>
          <div className="flex items-center gap-3 mt-3">
            {/* Project selector */}
            <div>
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white text-sm"
                disabled={loadingProjects}
              >
                {projects.length === 0 && <option value="">No projects</option>}
                {projects.map((p) => (
                  <option key={p._id ?? p.id} value={p._id ?? p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* status badge */}
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  selectedProject && selectedProject.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : selectedProject && selectedProject.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {selectedProject?.status ?? "—"}
              </span>

              <div className="text-sm text-gray-600">
                Progress:{" "}
                <span className="font-medium">
                  {computeProgress(selectedProject)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative p-2 rounded-md hover:bg-gray-100"
          >
            <FiBell className="text-gray-700" />
            {/* small red dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={() => navigate("/project-management/form")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            type="button"
          >
            <FiPlus />
            New Project
          </button>
        </div>
      </div>

      {/* Tabs - updated: removed Planning, added WBS and Task Dependencies */}
      <div className="flex gap-6 mt-4 border-b pb-3">
        <button
          className={`pb-2 text-sm ${
            activeTab === "gantt"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={`pb-2 text-sm ${
            activeTab === "wbs"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("wbs")}
        >
          Work Breakdown Structure
        </button>

        <button
          className={`pb-2 text-sm ${
            activeTab === "dependencies"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("dependencies")}
        >
          Task Dependencies
        </button>

        <button
          className={`pb-2 text-sm ${
            activeTab === "resources"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("resources")}
        >
          Resources
        </button>

        <button className="pb-2 text-sm text-gray-500 hover:text-gray-700">
          Budget
        </button>
        <button className="pb-2 text-sm text-gray-500 hover:text-gray-700">
          Reports
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">{renderContent()}</div>

      {/* Inline form (not modal) */}
      {showAdd && (
        <div className="mt-6">
          <ProjectForm
            onSave={(payload) => {
              console.log("Saved project:", payload);
              setShowAdd(false);
              fetchProjects();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Project;
