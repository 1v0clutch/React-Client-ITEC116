import React, { useEffect, useState } from "react";
import ProjectForm from "./ProjectForm";
import Overview from "./Overview";
import WorkBreakdown from "./WorkBreakdowns";
import TaskSchedule from "./TaskSchedule";
import Resource from "./Resource";
import Budget from "./Budget";
import Report from "./Report";
import ProjectGantt from "./ProjectGantt";
import { FiPlus, FiBell, FiList, FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const API_PROJECT = "http://localhost:8000/api/project";

function Project() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [taskProgressUpdates, setTaskProgressUpdates] = useState({});
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

  // Get all tasks from all phases
  const getAllTasks = (project) => {
    if (!project || !Array.isArray(project.phases)) return [];
    return project.phases.flatMap((phase) =>
      (phase.tasks || []).map((task) => ({
        ...task,
        phaseName: phase.name,
        phaseId: phase._id || phase.id,
      }))
    );
  };

  // Initialize progress updates when modal opens
  const handleOpenProgressModal = () => {
    if (!selectedProject) return;

    const tasks = getAllTasks(selectedProject);
    const initialProgress = {};
    tasks.forEach((task) => {
      initialProgress[task._id || task.id] = task.progress || 0;
    });
    setTaskProgressUpdates(initialProgress);
    setShowProgressModal(true);
  };

  const handleProgressChange = (taskId, progress) => {
    // Allow empty string for complete removal
    if (progress === "") {
      setTaskProgressUpdates((prev) => ({
        ...prev,
        [taskId]: 0, // Set to 0 when empty
      }));
      return;
    }

    const progressValue = Math.min(100, Math.max(0, parseInt(progress) || 0));
    setTaskProgressUpdates((prev) => ({
      ...prev,
      [taskId]: progressValue,
    }));
  };

  // Save progress updates to backend
  const saveProgressUpdates = async () => {
    if (!selectedProject) return;

    try {
      const updates = Object.entries(taskProgressUpdates).map(
        ([taskId, progress]) => ({
          taskId,
          progress: parseInt(progress) || 0,
        })
      );

      const response = await fetch(
        `${API_PROJECT}/${selectedProject._id || selectedProject.id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates }),
        }
      );

      if (response.ok) {
        console.log("Progress updated successfully");
        setShowProgressModal(false);
        setTaskProgressUpdates({}); // Clear updates
        fetchProjects(); // Refresh project data
      } else {
        console.error("Failed to update progress");
        alert("Failed to update progress. Please try again.");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Error updating progress. Please try again.");
    }
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
      case "report":
        return <Report project={selectedProject} />;
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

            {/* Status badge */}
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
          {/* Update Progress Button */}
          {selectedProject && (
            <button
              onClick={handleOpenProgressModal}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              type="button"
            >
              <FiEdit3 />
              Update Progress
            </button>
          )}

          {/* Notifications */}
          <button
            type="button"
            className="relative p-2 rounded-md hover:bg-gray-100"
          >
            <FiBell className="text-gray-700" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* View Projects Button */}
          <button
            onClick={() => navigate("/project-management/list")}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            type="button"
          >
            <FiList />
            View Projects
          </button>

          {/* Add Project Button */}
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

      {/* Tabs */}
      <div className="flex gap-6 mt-4 border-b pb-3">
        <button
          className={`pb-2 text-sm ${
            activeTab === "overview"
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

        <button
          className={`pb-2 text-sm ${
            activeTab === "budget"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("budget")}
        >
          Budget
        </button>

        <button
          className={`pb-2 text-sm ${
            activeTab === "report"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("report")}
        >
          Reports
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">{renderContent()}</div>

      {/* Progress Update Modal */}
      {showProgressModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Update Task Progress</h2>
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setTaskProgressUpdates({});
                }}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {getAllTasks(selectedProject).map((task) => (
                <div
                  key={task._id || task.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-600">{task.phaseName}</p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      Current: {task.progress || 0}%
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        taskProgressUpdates[task._id || task.id] ??
                        (task.progress || 0)
                      }
                      onChange={(e) =>
                        handleProgressChange(
                          task._id || task.id,
                          e.target.value
                        )
                      }
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          taskProgressUpdates[task._id || task.id] ??
                          (task.progress || 0)
                        }
                        onChange={(e) =>
                          handleProgressChange(
                            task._id || task.id,
                            e.target.value
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>

                  {/* Progress bar visualization */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            taskProgressUpdates[task._id || task.id] ??
                            (task.progress || 0)
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowProgressModal(false);
                  setTaskProgressUpdates({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProgressUpdates}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
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
