// functions/attendanceFunction.ts
import { Attendance } from '../models/attendanceModel';
import { Employee } from '../models/employeeModel';
import mongoose from 'mongoose';

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

// Get all attendance records for a specific date
export const getAttendanceByDate = async (date: string) => {
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(queryDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Find attendance records for the specified date
  const attendanceRecords = await Attendance.find({
    date: {
      $gte: queryDate,
      $lt: nextDay
    }
  });

  // If no records found for some employees, we'll need to get all employees
  const allEmployees = await Employee.find({});
  
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

  return finalAttendance;
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