import React, { useState } from "react";
import ProjectForm from "./ProjectForm";
import ProjectGantt from "./ProjectGantt";
import WorkBreakdown from "./WorkBreakdowns";
import TaskSchedule from "./TaskSchedule";
import { MdOutlineEditCalendar } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function Project() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState("gantt"); // Track active tab
  const navigate = useNavigate();

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "gantt":
        return <ProjectGantt />;
      case "wbs":
        return <WorkBreakdown />;
      case "schedule":
        return <TaskSchedule />;
      default:
        return <ProjectGantt />;
    }
  };

  return (
    <div className="bg-[#222e3c] w-full p-8 h-full overlay-hidden rounded-sm">
      <div className="flex justify-between items-center bg-[#2c3a4b] text-white rounded-xl p-6 shadow-md">
        {/* Left section */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineEditCalendar className="text-blue-400 text-2xl" />
            <h1 className="text-xl font-semibold">
              Project Planning & Scheduling
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Define timelines, create WBS, and manage dependencies
          </p>
        </div>

        {/* Right button - navigate to project form page */}
        <button
          onClick={() => navigate("/project-management/form")}
          className="flex items-center gap-1 text-white text-sm px-4 py-2 rounded-md transition-all"
          type="button"
        >
          <FiPlus className="text-md" />
          New Project
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mt-6 border-b border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "gantt"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("gantt")}
        >
          Gantt Chart View
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "wbs"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("wbs")}
        >
          Work Breakdown Structure
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "schedule"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("schedule")}
        >
          Task Schedule
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-6">{renderContent()}</div>

      {/* Inline form (not modal) */}
      {showAdd && (
        <div className="mt-6">
          <ProjectForm
            onSave={(payload) => {
              console.log("Saved project:", payload);
              setShowAdd(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Project;
