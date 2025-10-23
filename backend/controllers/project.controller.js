const Project = require("../models/Project");

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
      phases: req.body.phases.map((phase) => ({
        name: phase.name,
        startDate: phase.start,
        endDate: phase.end,
        progress: phase.progress || 0,
        tasks: phase.tasks.map((task) => ({
          name: task.name,
          startDate: task.start,
          endDate: task.end,
          durationDays: task.durationDays,
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
