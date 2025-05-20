// employeeRoutes.ts - Simplified without TypeScript types
import express from 'express';

// Import your controller functions - adjust path as needed
const { 
  addEmployee, 
  getEmployees, 
  getSingleEmployee, 
  updateEmployeeDetails, 
  deleteEmployeeDetails 
} = require('../controllers/addEmployeeController'); 
// Note: Using require() instead of import to avoid TypeScript issues

const router = express.Router();

// Create employee
router.post("/add-employee", addEmployee);

// Read all employees
router.get("/all", getEmployees);

// Read single employee
router.get("/:id", getSingleEmployee);

// Update employee
router.put("/update-employee/:id", updateEmployeeDetails);

// Delete employee
router.delete("/delete-employee/:id", deleteEmployeeDetails);

export default router;
