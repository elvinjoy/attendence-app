// functions/attendanceFunction.ts
import { Attendance } from '../models/attendanceModel';
import { Employee } from '../models/employeeModel';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';


interface AttendanceRecord {
  _id?: string | null;
  employeeId: string;
  date: Date;
  status: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  department: string;
  name: string;
  empId: string;
}

// Mark attendance for a single employee
export const markAttendance = async (attendanceData: any) => {
  const { employeeId, date, status, checkInTime, checkOutTime } = attendanceData;

  // Check if employee exists
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Parse the date to remove time portion for consistent daily records
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Try to find existing attendance record for this employee on this date
  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: attendanceDate,
  });

  if (existingAttendance) {
    // Update existing record
    const updated = await Attendance.findByIdAndUpdate(
      existingAttendance._id,
      {
        status,
        checkInTime: checkInTime || existingAttendance.checkInTime,
        checkOutTime: checkOutTime || existingAttendance.checkOutTime,
      },
      { new: true, runValidators: true }
    );
    return updated;
  } else {
    // Create new attendance record with employee info
    const newAttendance = new Attendance({
      employeeId,
      date: attendanceDate,
      status,
      checkInTime,
      checkOutTime,
      department: employee.department,
      name: `${employee.firstName} ${employee.lastName}`,
      empId: employee.empId
    });
    await newAttendance.save();
    return newAttendance;
  }
};

// Get attendance records with search and pagination
export const getAttendanceWithFilters = async (
  date: string,
  page: number = 1,
  limit: number = 8,
  searchQuery?: string
) => {
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(queryDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Create the query for finding employees
  let employeeQuery = {};
  
  // Add search functionality if search query provided
  if (searchQuery) {
    employeeQuery = {
      $or: [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { empId: { $regex: searchQuery, $options: 'i' } },
        { department: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ]
    };
  }

  // Calculate pagination parameters
  const skip = (page - 1) * limit;
  
  // Find all employees that match the search query
  const allEmployees = await Employee.find(employeeQuery)
    .sort({ empId: 1 })
    .skip(skip)
    .limit(limit);
  
  // Get total count of matching employees for pagination
  const totalEmployees = await Employee.countDocuments(employeeQuery);
  
  // Find attendance records for the specified date
  const attendanceRecords = await Attendance.find({
    date: {
      $gte: queryDate,
      $lt: nextDay
    },
    employeeId: { $in: allEmployees.map(emp => emp._id) }
  });
  
  // Create a map of existing attendance records by employee ID
  const attendanceMap = new Map();
  attendanceRecords.forEach(record => {
    attendanceMap.set(record.employeeId.toString(), record);
  });

  // Create the final list with attendance status for all employees
  const finalAttendance = allEmployees.map(employee => {
    const existingRecord = attendanceMap.get(employee._id.toString());
    
    if (existingRecord) {
      return existingRecord;
    } else {
      // Return default record for employees without attendance
      return {
        employeeId: employee._id,
        date: queryDate,
        status: 'Absent',
        checkInTime: '-',
        checkOutTime: '-',
        department: employee.department,
        name: `${employee.firstName} ${employee.lastName}`,
        empId: employee.empId,
        _id: null // No database ID since this is a virtual record
      };
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalEmployees / limit);

  return {
    attendanceRecords: finalAttendance,
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

// Mark attendance for multiple employees at once (bulk update)
export const markBulkAttendance = async (attendanceRecords: any[]) => {
  const operations = [];
  
  for (const record of attendanceRecords) {
    const { employeeId, date, status, checkInTime, checkOutTime } = record;
    
    // Parse the date to remove time portion
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Get employee info to include in the attendance record
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }
    
    operations.push({
      updateOne: {
        filter: { employeeId, date: attendanceDate },
        update: {
          $set: {
            status,
            checkInTime,
            checkOutTime,
            department: employee.department,
            name: `${employee.firstName} ${employee.lastName}`,
            empId: employee.empId
          }
        },
        upsert: true // Create if doesn't exist
      }
    });
  }

  return await Attendance.bulkWrite(operations);
};

export const generateAttendanceExcel = (attendanceData: AttendanceRecord[], date: string): Buffer => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for the main sheet
    const worksheetData = [
      // Header row
      ['S.No', 'Employee ID', 'Employee Name', 'Department', 'Status', 'Check-In Time', 'Check-Out Time', 'Date'],
      // Data rows
      ...attendanceData.map((record, index) => [
        index + 1,
        record.empId,
        record.name,
        record.department,
        record.status,
        record.checkInTime || '-',
        record.checkOutTime || '-',
        new Date(record.date).toLocaleDateString()
      ])
    ];

    // Create the main worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths for better formatting
    worksheet['!cols'] = [
      { width: 8 },   // S.No
      { width: 12 },  // Employee ID
      { width: 20 },  // Employee Name
      { width: 15 },  // Department
      { width: 12 },  // Status
      { width: 12 },  // Check-In Time
      { width: 12 },  // Check-Out Time
      { width: 12 }   // Date
    ];

    // Add the main worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    // Create summary data
    const totalEmployees = attendanceData.length;
    const statusCounts = attendanceData.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryData = [
      ['Attendance Summary'],
      ['Date', new Date(date).toLocaleDateString()],
      ['Generated On', new Date().toLocaleDateString()],
      [''],
      ['Total Employees', totalEmployees],
      [''],
      ['Status Breakdown:'],
      ...Object.entries(statusCounts).map(([status, count]) => [status, count]),
      [''],
      ['Attendance Percentage', `${((statusCounts['Present'] || 0) / totalEmployees * 100).toFixed(2)}%`]
    ];

    // Create summary worksheet
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ width: 20 }, { width: 15 }];

    // Add summary worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    return excelBuffer;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw new Error(`Excel generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};