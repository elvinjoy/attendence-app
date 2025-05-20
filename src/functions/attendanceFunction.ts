// functions/attendanceFunction.ts
import { Attendance } from '../models/attendanceModel';
import { Employee } from '../models/employeeModel';
import mongoose from 'mongoose';

// Create or update attendance record for an employee
export const markAttendance = async (attendanceData: any) => {
  const { employeeId, date, status, checkInTime, checkOutTime, notes, location } = attendanceData;

  // Check if employee exists
  const employeeExists = await Employee.findById(employeeId);
  if (!employeeExists) {
    throw new Error('Employee not found');
  }

  // Parse the date to remove time portion for consistent daily records
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  // Calculate work hours if both check-in and check-out times are provided
  let workHours = null;
  if (checkInTime && checkOutTime) {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    
    // Calculate the difference in milliseconds and convert to hours
    const diffMs = checkOut.getTime() - checkIn.getTime();
    workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  }

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
        workHours: workHours || existingAttendance.workHours,
        notes: notes || existingAttendance.notes,
        location: location || existingAttendance.location,
      },
      { new: true, runValidators: true }
    );
    return updated;
  } else {
    // Create new attendance record
    const newAttendance = new Attendance({
      employeeId,
      date: attendanceDate,
      status,
      checkInTime,
      checkOutTime,
      workHours,
      notes,
      location,
    });
    await newAttendance.save();
    return newAttendance;
  }
};

// Get attendance for a specific employee
export const getEmployeeAttendance = async (employeeId: string, startDate?: string, endDate?: string) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error('Invalid employee ID');
  }

  let query: any = { employeeId };

  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  return await Attendance.find(query)
    .sort({ date: -1 })
    .populate('employeeId', 'firstName lastName empId');
};

// Get all attendance records for a specific date
export const getAttendanceByDate = async (date: string) => {
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(queryDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return await Attendance.find({
    date: {
      $gte: queryDate,
      $lt: nextDay
    }
  }).populate('employeeId', 'firstName lastName empId');
};

// Get attendance statistics
export const getAttendanceStats = async (startDate?: string, endDate?: string) => {
  let matchStage: any = {};

  // Add date range filter if provided
  if (startDate || endDate) {
    matchStage.date = {};
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchStage.date.$gte = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.date.$lte = end;
    }
  }

  const stats = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  return stats;
};

// Delete attendance record
export const deleteAttendance = async (attendanceId: string) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new Error('Invalid attendance ID');
  }

  return await Attendance.findByIdAndDelete(attendanceId);
};

// Mark bulk attendance
export const markBulkAttendance = async (attendanceRecords: any[]) => {
  const operations = attendanceRecords.map(record => {
    // Parse the date to remove time portion
    const attendanceDate = new Date(record.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Calculate work hours if both check-in and check-out times are provided
    let workHours = null;
    if (record.checkInTime && record.checkOutTime) {
      const checkIn = new Date(record.checkInTime);
      const checkOut = new Date(record.checkOutTime);
      
      // Calculate the difference in milliseconds and convert to hours
      const diffMs = checkOut.getTime() - checkIn.getTime();
      workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    }

    return {
      updateOne: {
        filter: { employeeId: record.employeeId, date: attendanceDate },
        update: {
          $set: {
            status: record.status,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime,
            workHours,
            notes: record.notes,
            location: record.location,
          }
        },
        upsert: true // Create if doesn't exist
      }
    };
  });

  return await Attendance.bulkWrite(operations);
};