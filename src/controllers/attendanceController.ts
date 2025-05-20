// controllers/attendanceController.ts
import { Request, Response } from 'express';
import {
  markAttendance,
  getEmployeeAttendance,
  getAttendanceByDate,
  getAttendanceStats,
  deleteAttendance,
  markBulkAttendance
} from '../functions/attendanceFunction';

// Mark attendance for an employee
export const markEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const attendanceData = req.body;
    
    // Validate required fields
    if (!attendanceData.employeeId || !attendanceData.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID and status are required' 
      });
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

// Get attendance records for a specific employee
export const getAttendanceForEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    const attendanceRecords = await getEmployeeAttendance(
      employeeId,
      startDate as string,
      endDate as string
    );
    
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

// Get all attendance records for a specific date
export const getAttendanceForDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
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

// Get attendance statistics
export const getAttendanceStatistics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await getAttendanceStats(
      startDate as string,
      endDate as string
    );
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete an attendance record
export const deleteAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deleted = await deleteAttendance(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Mark attendance for multiple employees at once
export const markBulkEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const { attendanceRecords } = req.body;
    
    if (!attendanceRecords || !Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid attendance records array is required'
      });
    }
    
    // Validate each record has required fields
    for (const record of attendanceRecords) {
      if (!record.employeeId || !record.status) {
        return res.status(400).json({
          success: false,
          message: 'Each record must have employeeId and status'
        });
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