import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import Overview from "./Overview";
import WorkBreakdown from "./WorkBreakdowns";
import TaskSchedule from "./TaskSchedule";
import Resource from "./Resource";
import Budget from "./Budget";
import { FiPlus, FiBell, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

function Project() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("gantt");
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

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview project={selectedProject} />;
      case "wbs":
        return <WorkBreakdown project={selectedProject} />;
      case "dependencies":
        return <TaskSchedule project={selectedProject} />;
      case "resources":
        return <Resource project={selectedProject} />;
      case "budget":
        return <Budget project={selectedProject} />;
      default:
        return <Overview project={selectedProject} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Project Management</h2>
            <p className="text-white/80 text-sm">Manage projects, tasks, resources, and budgets</p>
          </div>
        </div>

        {/* Enhanced Project Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Enhanced Project Selector */}
            <div className="flex flex-col group">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/90 mb-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Select Project
              </label>
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="border-2 border-white/20 rounded-xl px-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                disabled={loadingProjects}
              >
                {projects.length === 0 && <option value="">No projects</option>}
                {projects.map((p) => (
                  <option key={p._id ?? p.id} value={p._id ?? p.id} className="text-gray-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Status and Progress */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium">Status:</span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      selectedProject && selectedProject.status === "In Progress"
                        ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                        : selectedProject && selectedProject.status === "Completed"
                        ? "bg-green-500/20 text-green-200 border border-green-400/30"
                        : "bg-gray-500/20 text-gray-200 border border-gray-400/30"
                    }`}
                  >
                    {selectedProject?.status ?? "—"}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium">Progress:</span>
                  <span className="text-white font-bold">
                    {computeProgress(selectedProject)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              className="relative bg-white/10 backdrop-blur-sm p-3 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <FiBell className="text-white w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* View Projects Button */}
            <button
              onClick={() => navigate("/project-management/list")}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2 font-medium"
              type="button"
            >
              <FiList className="w-4 h-4" />
              View Projects
            </button>

            {/* Add Project Button */}
            <button
              onClick={() => navigate("/project-management/form")}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg"
              type="button"
            >
              <FiPlus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-xl mb-8 border-2 border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto">
          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </div>
          </button>

          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "wbs"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setActiveTab("wbs")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Work Breakdown
            </div>
          </button>

          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "dependencies"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setActiveTab("dependencies")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Dependencies
            </div>
          </button>

          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "resources"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setActiveTab("resources")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Resources
            </div>
          </button>

          <button
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
              activeTab === "budget"
                ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                : "text-gray-600 hover:text-teal-600 hover:bg-teal-50"
            }`}
            onClick={() => setActiveTab("budget")}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Budget
            </div>
          </button>

          <button className="flex-1 px-6 py-4 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
        {renderContent()}
      </div>

      {showAdd && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
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
