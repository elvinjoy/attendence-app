// routes/attendanceRoutes.ts
import express from 'express';
import {
  markEmployeeAttendance,
  getAttendanceForEmployee,
  getAttendanceForDate,
  getAttendanceStatistics,
  deleteAttendanceRecord,
  markBulkEmployeeAttendance
} from '../controllers/attendanceController';

const router = express.Router();

// To handle TypeScript errors, wrap controller functions
// Mark attendance for a single employee
router.post('/mark', function(req, res) {
  markEmployeeAttendance(req, res);
});

// Mark attendance for multiple employees at once
router.post('/mark-bulk', function(req, res) {
  markBulkEmployeeAttendance(req, res);
});

// Get attendance records for a specific employee
router.get('/employee/:employeeId', function(req, res) {
  getAttendanceForEmployee(req, res);
});

// Get all attendance records for a specific date
router.get('/date/:date', function(req, res) {
  getAttendanceForDate(req, res);
});

// Get attendance statistics
router.get('/stats', function(req, res) {
  getAttendanceStatistics(req, res);
});

// Delete an attendance record
router.delete('/:id', function(req, res) {
  deleteAttendanceRecord(req, res);
});

export default router;