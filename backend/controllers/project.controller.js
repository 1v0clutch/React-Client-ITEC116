const Project = require("../models/Project");
const Employee = require("../models/Employee");

exports.create = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      status,
      phases,
      totalBudget,
      resourceAllocations,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    // Process phases and tasks to ensure proper date handling
    const processedPhases = (phases || []).map((phase) => {
      const processedTasks = (phase.tasks || []).map((task) => {
        // Convert frontend 'start'/'end' to 'startDate'/'endDate' if needed
        const startDate = task.startDate || task.start;
        const endDate = task.endDate || task.end;

        // Calculate duration if dates are provided
        let durationDays = task.durationDays || 0;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          durationDays = Math.max(0, durationDays); // Ensure non-negative
        }

        return {
          name: task.name,
          description: task.description || "",
          startDate: startDate,
          endDate: endDate,
          durationDays: durationDays,
          progress: task.progress || 0,
          status: task.status || "Not Started",
          assignee: task.assignee || "",
          dependencies: task.dependencies || [],
        };
      });

      return {
        name: phase.name,
        description: phase.description || "",
        startDate: phase.startDate,
        endDate: phase.endDate,
        tasks: processedTasks,
      };
    });

    // Create project with processed phases
    let project = new Project({
      name,
      description,
      startDate,
      endDate,
      status: status || "Planned",
      phases: processedPhases,
      totalBudget: totalBudget || 0,
    });

    project = await project.save();

    // ... rest of your existing code for resource allocations ...
    const allocations = [];
    const teamSet = new Set();

    if (Array.isArray(resourceAllocations) && resourceAllocations.length > 0) {
      for (const alloc of resourceAllocations) {
        const { employeeId, taskName, phaseName, equipment, budget } = alloc;

        const employee = await Employee.findById(employeeId);
        if (!employee) continue;

        let taskRef = null;

        // Find the corresponding phase & task by name
        for (const phase of project.phases) {
          if (phase.name !== phaseName) continue;

          for (const task of phase.tasks) {
            if (task.name === taskName) {
              // 🧩 Assign employee name to task
              task.assignee = employee.name;
              taskRef = task._id;
              break;
            }
          }
          if (taskRef) break;
        }

        // Add allocation to employee
        employee.allocations.push({
          project: project._id,
          task: taskRef,
          allocationType: "Task",
          workloadPercent: Math.floor(Math.random() * 40 + 60),
        });
        await employee.save();

        // Add allocation to project record
        allocations.push({
          employee: employee._id,
          task: taskRef,
          equipment,
          budget,
        });

        // Add employee to project team
        teamSet.add(String(employee._id));
      }

      project.resourceAllocations = allocations;
      project.team = Array.from(teamSet);
    }

    // Final save to trigger any hooks
    await project.save();

    res.status(201).json({
      message: "Project created successfully with allocations & durations",
      projectId: project._id,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({
      message: err.message || "Failed to create project.",
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

// ✅ Get all tasks under a specific project
exports.getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Flatten all phases' tasks into one list
    const tasks = project.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        ...task.toObject(),
        phaseName: phase.name,
      }))
    );

    res.json({ projectId: project._id, name: project.name, tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error retrieving project tasks" });
  }
};

/**
 * Update or save resource allocations for a project
 * This syncs data between Project (allocations) and Employee (allocations).
 */
exports.updateResourceAllocations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { totalBudget, resourceAllocations } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (totalBudget) project.totalBudget = totalBudget;

    const allocations = [];

    for (const alloc of resourceAllocations) {
      const { employeeId, taskId, equipment, budget, startDate, endDate } =
        alloc;

      const employee = await Employee.findById(employeeId);
      if (!employee) continue;

      // remove existing allocations for this project-task pair
      employee.allocations = employee.allocations.filter(
        (a) =>
          String(a.project) !== String(projectId) ||
          (taskId && String(a.task) !== String(taskId))
      );

      employee.allocations.push({
        project: project._id,
        task: taskId,
        allocationType: "Task",
        workloadPercent: Math.floor(Math.random() * 40 + 60),
        startDate,
        endDate,
      });

      await employee.save();

      allocations.push({
        employee: employee._id,
        task: taskId,
        equipment,
        budget,
        startDate,
        endDate,
      });
    }

    project.resourceAllocations = allocations;
    await project.save();

    res.json({ message: "✅ Allocations updated successfully!", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get resource allocations for a specific project
exports.getResourceAllocations = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("resourceAllocations.employee", "name email position")
      .populate("resourceAllocations.task", "name phaseName");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      projectId: project._id,
      projectName: project.name,
      resourceAllocations: project.resourceAllocations || [],
    });
  } catch (err) {
    console.error("Error fetching resource allocations:", err);
    res.status(500).json({ message: "Error retrieving resource allocations" });
  }
};

// ✅ Add single resource allocation to project
exports.addResourceAllocation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { employeeId, taskId, equipment, budget } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify task exists in project
    let taskExists = false;
    let taskName = "";
    let phaseName = "";

    for (const phase of project.phases) {
      for (const task of phase.tasks) {
        if (String(task._id) === String(taskId)) {
          taskExists = true;
          taskName = task.name;
          phaseName = phase.name;
          break;
        }
      }
      if (taskExists) break;
    }

    if (!taskExists) {
      return res.status(404).json({ message: "Task not found in project" });
    }

    // Check if allocation already exists
    const existingAllocation = project.resourceAllocations.find(
      (alloc) =>
        String(alloc.employee) === String(employeeId) &&
        String(alloc.task) === String(taskId)
    );

    if (existingAllocation) {
      return res
        .status(400)
        .json({ message: "Resource allocation already exists" });
    }

    // Add allocation to project
    const newAllocation = {
      employee: employeeId,
      task: taskId,
      equipment: equipment || "",
      budget: budget || 0,
    };

    project.resourceAllocations.push(newAllocation);
    await project.save();

    // Add allocation to employee
    employee.allocations.push({
      project: projectId,
      task: taskId,
      allocationType: "Task",
      workloadPercent: Math.floor(Math.random() * 40 + 60),
    });
    await employee.save();

    res.status(201).json({
      message: "Resource allocation added successfully",
      allocation: newAllocation,
    });
  } catch (err) {
    console.error("Error adding resource allocation:", err);
    res.status(500).json({ message: "Error adding resource allocation" });
  }
};

// ✅ Delete resource allocation
exports.deleteResourceAllocation = async (req, res) => {
  try {
    const { projectId, allocationId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find the allocation to get employee and task info
    const allocation = project.resourceAllocations.id(allocationId);
    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    // Remove from project
    project.resourceAllocations.pull(allocationId);
    await project.save();

    // Remove from employee's allocations
    const employee = await Employee.findById(allocation.employee);
    if (employee) {
      employee.allocations = employee.allocations.filter(
        (alloc) =>
          !(
            String(alloc.project) === String(projectId) &&
            String(alloc.task) === String(allocation.task)
          )
      );
      await employee.save();
    }

    res.json({ message: "Resource allocation deleted successfully" });
  } catch (err) {
    console.error("Error deleting resource allocation:", err);
    res.status(500).json({ message: "Error deleting resource allocation" });
  }
};
