const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");

router.post("/", employeeController.create);
router.get("/", employeeController.getAll);
router.get("/:id", employeeController.getById);
router.put("/:id", employeeController.update);
router.delete("/:id", employeeController.delete);

module.exports = router;
