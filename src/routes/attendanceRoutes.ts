// routes/attendanceRoutes.ts
import express from 'express';
import {
  markEmployeeAttendance,
  getAttendanceForDateWithFilters,
  markBulkEmployeeAttendance,
  downloadAttendanceExcel 
} from '../controllers/attendanceController';
import { adminProtect } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// Add admin authentication middleware to all routes
router.use(adminProtect);

// Get attendance records for a specific date with search and pagination
router.get('/date/:date', (req, res) => {
  getAttendanceForDateWithFilters(req, res);
});

// Mark attendance for a single employee
router.post('/mark', (req, res) => {
  markEmployeeAttendance(req, res);
});

// Mark attendance for multiple employees at once
router.post('/mark-bulk', (req, res) => {
  markBulkEmployeeAttendance(req, res);
});

router.get('/download/:date',(req, res)=>{
  downloadAttendanceExcel(req, res);
});
export default router;