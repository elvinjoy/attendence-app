// functions/employeeFunction.ts
import validator from 'validator';
import { Employee } from '../models/employeeModel';

// Database function to create an employee
export const createNewEmployee = async (employeeData: any) => {
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
    address,
  } = employeeData;

  // Validation
  if (
    !empId || !firstName || !lastName || !department || !country ||
    !state || !city || !dateOfJoining || !dob || !email || !mobile || !address
  ) {
    throw new Error('All fields are required.');
  }

  if (!validator.isEmail(email)) {
    throw new Error('Invalid email address.');
  }

  if (!validator.isMobilePhone(mobile, 'any')) {
    throw new Error('Invalid mobile number.');
  }

  const existingEmployee = await Employee.findOne({ email });
  if (existingEmployee) {
    throw new Error('Employee already exists with this email.');
  }

  // Check for duplicate employee ID
  const existingEmpId = await Employee.findOne({ empId });
  if (existingEmpId) {
    throw new Error('Employee ID already in use.');
  }

  const newEmployee = new Employee({
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
  });

  await newEmployee.save();
  return newEmployee;
};

// Get All Employees from database
export const getAllEmployees = async () => {
  return await Employee.find().sort({ createdAt: -1 });
};

// Get Employee by ID from database
export const getEmployeeById = async (id: string) => {
  return await Employee.findById(id);
};

// Update Employee in database
export const updateEmployee = async (id: string, data: any) => {
  // Validate email if it's being updated
  if (data.email && !validator.isEmail(data.email)) {
    throw new Error('Invalid email address');
  }
  
  // Validate mobile if it's being updated
  if (data.mobile && !validator.isMobilePhone(data.mobile, 'any')) {
    throw new Error('Invalid mobile number');
  }
  
  // Check if email is already in use by another employee
  if (data.email) {
    const existingEmployee = await Employee.findOne({ 
      email: data.email,
      _id: { $ne: id } // Exclude current employee
    });
    
    if (existingEmployee) {
      throw new Error('Email is already in use by another employee');
    }
  }
  
  // Check if empId is already in use by another employee
  if (data.empId) {
    const existingEmployee = await Employee.findOne({ 
      empId: data.empId,
      _id: { $ne: id } // Exclude current employee
    });
    
    if (existingEmployee) {
      throw new Error('Employee ID is already in use by another employee');
    }
  }
  
  return await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Employee from database
export const deleteEmployee = async (id: string) => {
  return await Employee.findByIdAndDelete(id);
};