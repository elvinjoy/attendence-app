import express from 'express';

// const { 
//   addEmployee, 
//   getEmployees, 
//   getSingleEmployee, 
//   updateEmployeeDetails, 
//   deleteEmployeeDetails 
// } = require('../controllers/addEmployeeController'); 
import {addEmployee, 
  getEmployees, 
  getSingleEmployee, 
  updateEmployeeDetails, 
  deleteEmployeeDetails } from '../controllers/addEmployeeController';


const router = express.Router();

router.post("/add-employee", addEmployee);

router.get("/all", getEmployees);

router.get("/:id", getSingleEmployee);

router.put("/update-employee/:id", updateEmployeeDetails);

router.delete("/delete-employee/:id", deleteEmployeeDetails);

export default router;