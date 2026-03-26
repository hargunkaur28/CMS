import express from 'express';
import {
  markAttendance,
  getAttendanceByBatch,
  getStudentAttendance,
  getShortageAlerts,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Mark attendance (faculty/admin)
router.post('/mark', protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), markAttendance);

// Get records for a batch+date
router.get('/', protect, getAttendanceByBatch);

// AI shortage alerts
router.get('/shortage-alerts', protect, authorize('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), getShortageAlerts);

// Per-student summary
router.get('/student/:studentId', protect, getStudentAttendance);

export default router;
