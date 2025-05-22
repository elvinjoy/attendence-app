// controllers/addEmployeeController.ts
import { Request, Response } from "express";
import { createNewEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee, searchEmployees } from "../functions/employeeFunction";

// Create new employee
export const addEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      empId,
      firstName,
      lastName,
      department,
      country,
      state,
      city,
      dateOfJoining,
      dob,
      email,
      mobile,
      address
    } = req.body;
    
    // Check if any required field is missing
    if (!empId || !firstName || !lastName || !department || !country || 
        !state || !city || !dateOfJoining || !dob || !email || !mobile || !address) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }
    
    // Handle file data
    if (!req.file) {
      res.status(400).json({ message: "Profile image is required" });
      return;
    }
    
    // Prepare employee data object
    const employeeData = {
      empId,
      firstName,
      lastName,
      department,
      country,
      state,
      city,
      dateOfJoining,
      dob,
      email,
      mobile,
      address,
      photo: req.file.path
    };
    
    // Create the employee
    const newEmployee = await createNewEmployee(employeeData);
    
    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: newEmployee
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to add employee" });
  }
};

// Get all employees
export const getEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = req.query.search as string;
    
    // Validate page and limit
    if (page < 1) {
      res.status(400).json({ 
        success: false, 
        message: "Page number should be at least 1"
      });
      return;
    }
    
    if (limit < 1 || limit > 100) {
      res.status(400).json({ 
        success: false, 
        message: "Limit should be between 1 and 100"
      });
      return;
    }
    
    // Get paginated employees
    const result = await getAllEmployees(page, limit, search);
    
    res.status(200).json({
      success: true,
      count: result.employees.length,
      data: result.employees,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to retrieve employees" 
    });
  }
};

// Get single employee
export const getSingleEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to retrieve employee" });
  }
};

export const searchEmployeesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    if (!query) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    const employees = await searchEmployees(query as string);
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update employee details
export const updateEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      updateData.photo = req.file.path;
    }
    
    const updatedEmployee = await updateEmployee(req.params.id, updateData);
    if (!updatedEmployee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to update employee" });
  }
};

// Delete employee
export const deleteEmployeeDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await deleteEmployee(req.params.id);
    if (!employee) {
      res.status(404).json({ message: "Employee not found" });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete employee" });
  }
};