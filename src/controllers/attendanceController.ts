// controllers/attendanceController.ts
import { Request, Response } from 'express';
import {
  markAttendance,
  getAttendanceByDate,
  markBulkAttendance
} from '../functions/attendanceFunction';

// Mark attendance for an employee
export const markEmployeeAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const attendanceData = req.body;
    
    // Validate required fields
    if (!attendanceData.employeeId || !attendanceData.status) {
      res.status(400).json({ 
        success: false, 
        message: 'Employee ID and status are required' 
      });
      return;
    }
    
    // Set date to today if not provided
    if (!attendanceData.date) {
      attendanceData.date = new Date();
    }
    
    const attendance = await markAttendance(attendanceData);
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all attendance records for a specific date
export const getAttendanceForDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    
    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date is required'
      });
      return;
    }
    
    const attendanceRecords = await getAttendanceByDate(date);
    
    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark attendance for multiple employees at once
export const markBulkEmployeeAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceRecords } = req.body;
    
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Valid attendance records array is required'
      });
      return;
    }
    
    // Validate each record has required fields
    for (const record of attendanceRecords) {
      if (!record.employeeId || !record.status) {
        res.status(400).json({
          success: false,
          message: 'Each record must have employeeId and status'
        });
        return;
      }
      
      // Set date to today if not provided
      if (!record.date) {
        record.date = new Date();
      }
    }
    
    const result = await markBulkAttendance(attendanceRecords);
    
    res.status(201).json({
      success: true,
      message: 'Bulk attendance marked successfully',
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
