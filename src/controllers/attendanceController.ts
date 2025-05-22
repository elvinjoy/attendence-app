// controllers/attendanceController.ts
import { Request, Response } from 'express';
import {
  markAttendance,
  getAttendanceWithFilters,
  markBulkAttendance,
  generateAttendanceExcel  // Changed from generateAttendancePDF
} from '../functions/attendanceFunction';
import { Attendance } from '../models/attendanceModel'

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

// Get attendance records with search and pagination
export const getAttendanceForDateWithFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = req.query.search as string;
    
    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date is required'
      });
      return;
    }
    
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
    
    const result = await getAttendanceWithFilters(date, page, limit, search);
    
    res.status(200).json({
      success: true,
      count: result.attendanceRecords.length,
      data: result.attendanceRecords,
      pagination: result.pagination
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

export const downloadAttendanceExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.params;

    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date is required'
      });
      return;
    }

    // Create separate date objects to avoid mutation issues
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // console.log('Searching for date range:', {
    //   requestedDate: date,
    //   startOfDay: startOfDay.toISOString(),
    //   endOfDay: endOfDay.toISOString()
    // });

    const attendanceDocuments = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ name: 1 });

    // console.log('Found documents:', attendanceDocuments.length);

    if (attendanceDocuments.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No attendance data found for this date'
      });
      return;
    }

    // Convert Mongoose documents to plain objects with the correct interface
    const attendanceData = attendanceDocuments.map(doc => ({
      _id: doc._id?.toString() || null,
      employeeId: doc.employeeId.toString(),
      date: doc.date,
      status: doc.status,
      checkInTime: doc.checkInTime || undefined,
      checkOutTime: doc.checkOutTime || undefined,
      department: doc.department,
      name: doc.name,
      empId: doc.empId
    }));

    // console.log('Attendance data for Excel:', attendanceData.length, 'records');

    // Fixed: Call generateAttendanceExcel with correct parameters
    const buffer = generateAttendanceExcel(attendanceData, date);
    // console.log('Excel buffer generated, size:', buffer.length);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${date}.xlsx`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Excel generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};