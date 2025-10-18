import React from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function ProjectGantt() {
  const tasks = [
    {
      start: new Date("2025-10-10"),
      end: new Date("2025-10-20"),
      name: "Phase 1: Planning",
      id: "1",
      type: "project",
      progress: 60,
      isDisabled: false,
    },
    {
      start: new Date("2025-10-12"),
      end: new Date("2025-10-18"),
      name: "Define Requirements",
      id: "2",
      type: "task",
      progress: 100,
      project: "1",
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Project Timeline
      </h1>
      <Gantt tasks={tasks} viewMode={ViewMode.Day} />
    </div>
  );
}
