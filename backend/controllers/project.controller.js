const Project = require("../models/Project");
const Employee = require("../models/Employee");

// Create and Save a new Project
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    return res.status(400).send({ message: "Project name cannot be empty" });
  }

  try {
    // Create a Project
    const project = new Project({
      name: req.body.name,
      description: req.body.description || "",
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status || "Planned",

      // ✅ FIX: map startDate and endDate correctly
      phases: (req.body.phases || []).map((phase) => ({
        name: phase.name,
        startDate: phase.startDate || phase.start || null,
        endDate: phase.endDate || phase.end || null,
        progress: phase.progress || 0,

        tasks: (phase.tasks || []).map((task) => ({
          name: task.name,
          startDate: task.startDate || task.start || null,
          endDate: task.endDate || task.end || null,
          durationDays: task.durationDays || null,
          assignee: task.assignee || null,
          dependencies: task.dependencies || [],
          progress: task.progress || 0,
          status: task.status || "Not Started",
        })),
      })),
    });

    // Save Project in the database
    const savedProject = await project.save();
    res.status(201).send(savedProject);
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Project.",
    });
  }
};

// Find all Projects
exports.findAll = async (req, res) => {
  try {
    const projects = await Project.find();
    res.send(projects);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving projects.",
    });
  }
};

// Find a single Project with an id
exports.findOne = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send({
        message: "Project not found with id " + req.params.id,
      });
    }
    res.send(project);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).send({
        message: "Project not found with id " + req.params.id,
      });
    }
    res.status(500).send({
      message: "Error retrieving project with id " + req.params.id,
    });
  }
};

// Get Gantt Chart data for a specific project
exports.getGanttById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).send({
        message: "Project not found with id " + req.params.id,
      });
    }

    // Transform project phases & tasks into Gantt-friendly structure if needed
    const ganttData = {
      id: project._id,
      name: project.name,
      startDate: project.startDate,
      endDate: project.endDate,
      phases: project.phases.map((phase) => ({
        id: phase._id,
        name: phase.name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        tasks: phase.tasks.map((task) => ({
          id: task._id,
          name: task.name,
          startDate: task.startDate,
          endDate: task.endDate,
          progress: task.progress || 0,
          status: task.status || "Not Started",
        })),
      })),
    };

    res.status(200).send(ganttData);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Gantt data for project.",
    });
  }
};

// Update all tasks within a project
exports.updateTasks = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { tasks } = req.body; // expect flattened task array

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Re-map tasks into their respective phases
    const taskMap = new Map(tasks.map((t) => [t.dbId || t._id, t]));

    project.phases.forEach((phase) => {
      phase.tasks.forEach((task) => {
        const updated = taskMap.get(String(task._id));
        if (updated) {
          task.name = updated.name || task.name;
          task.startDate = updated.startDate || updated.start || task.startDate;
          task.endDate = updated.endDate || updated.end || task.endDate;
          task.durationDays =
            updated.durationDays || updated.duration || task.durationDays;
          task.assignee = updated.assignee || task.assignee;
          task.dependencies = Array.isArray(updated.dependencies)
            ? updated.dependencies
            : task.dependencies;
          task.status = updated.status || task.status;
        }
      });
    });

    const saved = await project.save();
    res.status(200).json(saved);
  } catch (err) {
    console.error("Error updating project tasks:", err);
    res.status(500).json({
      message: err.message || "Error updating project tasks",
    });
  }
};

// Update an existing project
exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res
      .status(500)
      .json({ message: "Failed to update project", error: err.message });
  }
};

exports.assignEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      projectId,
      phaseId,
      taskId,
      allocationType,
      workloadPercent,
      startDate,
      endDate,
    } = req.body;

    // 1️⃣ Validate
    if (!employeeId || !projectId)
      return res
        .status(400)
        .json({ message: "employeeId and projectId are required" });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // 2️⃣ Assign in Project side
    if (taskId) {
      // assign directly to task
      project.phases.forEach((p) =>
        p.tasks.forEach((t) => {
          if (String(t._id) === String(taskId)) {
            t.assignee = employee._id;
          }
        })
      );
    } else if (phaseId) {
      // assign all tasks in a phase
      project.phases.forEach((p) => {
        if (String(p._id) === String(phaseId)) {
          p.tasks.forEach((t) => (t.assignee = employee._id));
        }
      });
    } else {
      // assign all project tasks if phase/task not specified
      project.phases.forEach((p) => {
        p.tasks.forEach((t) => (t.assignee = employee._id));
      });
    }

    await project.save();

    // 3️⃣ Record allocation in Employee side
    employee.allocations.push({
      project: projectId,
      phase: phaseId || null,
      task: taskId || null,
      allocationType:
        allocationType || (taskId ? "Task" : phaseId ? "Phase" : "Project"),
      workloadPercent: workloadPercent || 0,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
    });

    await employee.save();

    res.status(200).json({
      message: "Employee assigned successfully",
      project,
      employee,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: err.message || "Error assigning employee" });
  }
};
