// routes/attendanceRoutes.ts
import express from 'express';
import {
  markEmployeeAttendance,
  getAttendanceForDate,
  markBulkEmployeeAttendance
} from '../controllers/attendanceController';
import { adminProtect } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Add admin authentication middleware to all routes
router.use(adminProtect);

// Get all attendance records for a specific date
router.get('/date/:date', (req, res) => {
  getAttendanceForDate(req, res);
});

// Mark attendance for a single employee
router.post('/mark', (req, res) => {
  markEmployeeAttendance(req, res);
});

// Mark attendance for multiple employees at once
router.post('/mark-bulk', (req, res) => {
  markBulkEmployeeAttendance(req, res);
});

export default router;