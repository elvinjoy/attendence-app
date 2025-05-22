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
    photo,
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
    photo,
  });

  await newEmployee.save();
  return newEmployee;
};

// Get all Employees with paginated list of employees

export const getAllEmployees = async (page: number = 1, limit: number = 8, searchQuery?: string) => {
  // Calculate how many documents to skip
  const skip = (page - 1) * limit;
  
  // Build the query
  let query = {};
  
  // Add search functionality if search query provided
  if (searchQuery) {
    query = {
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { department: { $regex: searchQuery, $options: 'i' } },
        { empId: { $regex: searchQuery, $options: 'i' } }
      ]
    };
  }
  
  // Execute the query with pagination
  const employees = await Employee.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count for pagination
  const totalEmployees = await Employee.countDocuments(query);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalEmployees / limit);
  
  return {
    employees,
    pagination: {
      total: totalEmployees,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Get Employee by ID from database
export const getEmployeeById = async (id: string) => {
  return await Employee.findById(id);
};

// Add this function to your employeeFunction.ts file

export const searchEmployees = async (searchQuery: string) => {
  if (!searchQuery || searchQuery.trim() === '') {
    throw new Error('Search query is required');
  }

  const employees = await Employee.find({
    $or: [
      { empId: { $regex: searchQuery, $options: 'i' } },
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } }
    ]
  }).select('empId firstName lastName department').sort({ empId: 1 }).limit(20);

  return employees.map(emp => ({
    _id: emp._id,
    empId: emp.empId,
    name: `${emp.firstName} ${emp.lastName}`,
    department: emp.department
  }));
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