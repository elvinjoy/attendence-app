import express from "express";
import {
  addEmployee,
  getEmployees,
  getSingleEmployee,
  updateEmployeeDetails,
  deleteEmployeeDetails,
  searchEmployeesController
} from "../controllers/addEmployeeController";

import { adminProtect } from "../middleware/adminAuthMiddleware";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/search", adminProtect, searchEmployeesController);
router.post("/add-employee", adminProtect, upload.single("photo"), addEmployee);
router.get("/all", adminProtect, getEmployees);
router.get("/:id", adminProtect, getSingleEmployee);
router.put("/update-employee/:id", adminProtect, upload.single("photo"), updateEmployeeDetails);
router.delete("/delete-employee/:id", adminProtect, deleteEmployeeDetails);

export default router;