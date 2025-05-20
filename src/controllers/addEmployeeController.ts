// employeeController.ts
// Place this file directly in your src folder or where it matches your imports
import { Request, Response } from "express";
import { Employee } from "../models/employeeModel";
import { getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } from "../functions/employeeFunction";

// Create new employee
export const addEmployee = async (req: Request, res: Response) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all employees
export const getEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await getAllEmployees();
    res.status(200).json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to get employees" });
  }
};

// Get a single employee by ID
export const getSingleEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
       res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ data: employee });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to get employee" });
  }
};

// Update an employee
export const updateEmployeeDetails = async (req: Request, res: Response) => {
  try {
    const updated = await updateEmployee(req.params.id, req.body);
    if (!updated) {
       res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update employee" });
  }
};

// Delete an employee
export const deleteEmployeeDetails = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteEmployee(req.params.id);
    if (!deleted) {
       res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
};