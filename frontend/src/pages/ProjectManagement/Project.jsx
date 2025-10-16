import React, { useState } from "react";
import ProjectForm from "./ProjectForm";
import { MdOutlineEditCalendar } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function Project() {
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

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
