import express from "express";
import {
  addEmployee,
  getEmployees,
  getSingleEmployee,
  updateEmployeeDetails,
  deleteEmployeeDetails,
} from "../controllers/addEmployeeController";

import { adminProtect } from "../middleware/adminAuthMiddleware";
import { upload } from "../middleware/upload";

const router = express.Router();

// Routes with appropriate middleware
router.post("/add-employee", adminProtect, upload.single("photo"), addEmployee);
router.get("/all", adminProtect, getEmployees);
router.get("/:id", adminProtect, getSingleEmployee);
router.put("/update-employee/:id", adminProtect, upload.single("photo"), updateEmployeeDetails);
router.delete("/delete-employee/:id", adminProtect, deleteEmployeeDetails);

export default router;