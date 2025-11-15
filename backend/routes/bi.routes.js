const express = require("express");
const router = express.Router();
const biController = require("../controllers/bi.controller");

// Data Pull Endpoints
router.get("/pull-all", biController.pullAllModulesData); // Pull data from all modules
router.get("/pull-module/:moduleId", biController.pullModuleData); // Pull data from specific module

// Dummy Data Endpoints
router.post("/generate-dummy-data", biController.generateDummyData); // Generate dummy data for all modules

// Data Processing Endpoints
router.get("/process-summarize", biController.processAndSummarize); // Process snapshots into summaries
router.get("/summaries", biController.getSummaries); // Get all summaries
router.get("/snapshots", biController.getSnapshots); // Get all snapshots
router.get("/snapshots/:id", biController.getSnapshotById); // Get specific snapshot by ID

// Report Endpoints
router.post("/reports", biController.createReport); // Create a report structure
router.get("/reports", biController.getReports); // Get all reports
router.get("/dashboard", biController.generateDashboard); // Generate comprehensive dashboard

module.exports = router;

