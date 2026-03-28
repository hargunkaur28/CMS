import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as timetableController from '../controllers/timetableController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as marksController from '../controllers/marksController.js';
import * as uploadController from '../controllers/uploadController.js';
import * as teacherStudentController from '../controllers/teacherStudentController.js';
import * as communicationController from '../controllers/communicationController.js';
import { uploadDocument } from '../utils/cloudinaryUploader.js'; // Reusing existing Cloudinary config

const router = express.Router();

// Middleware stack for all routes
router.use(protect);
router.use(authorize('TEACHER'));

// --- Timetable ---
router.get('/timetable', timetableController.getTimetable);
router.get('/timetable/today', timetableController.getTodayTimetable);

// --- Attendance ---
router.post('/attendance/mark', attendanceController.markAttendance);
router.get('/attendance/:classId', attendanceController.getClassAttendance);
router.get('/attendance/report/monthly', attendanceController.getMonthlyReport);
router.get('/attendance/shortage', attendanceController.getShortageAlerts);

// --- Marks ---
router.get('/marks/exams', marksController.getAssignedExams);
router.post('/marks/enter', marksController.enterMarks);
router.get('/marks/:examId', marksController.getMarksByExam);
router.put('/marks/:markId', marksController.editMarks);

// --- Uploads ---
router.post('/upload', uploadDocument.single('file'), uploadController.uploadMaterial);
router.get('/materials', uploadController.getMaterials);
router.delete('/materials/:id', uploadController.deleteMaterial);

// --- Students ---
router.get('/students', teacherStudentController.getMyStudents);
router.get('/students/:studentId', teacherStudentController.getStudentProfile);

// --- Communication ---
router.post('/announcements', communicationController.createAnnouncement);
router.get('/announcements', communicationController.getAnnouncements);
router.post('/messages', communicationController.sendMessage);
router.get('/messages/:studentUserId', communicationController.getConversation);

export default router;
