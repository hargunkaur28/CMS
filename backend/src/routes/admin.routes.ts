import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import multer from "multer";
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  submitApplication,
  getApplications,
  updateApplicationStatus,
  enrollStudent,
  getAdmissionsReport
} from "../controllers/admissionsController.js";
import {
  getStudents,
  getStudentById,
  updateStudent,
  softDeleteStudent,
  bulkImportStudents,
  updateStudentStatus
} from "../controllers/studentsController.js";
import {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  softDeleteFaculty,
  assignSubjects
} from "../controllers/facultyController.js";
import {
  getCourses,
  createCourse,
  updateCourse,
  getSubjects,
  createSubject,
  getBatches,
  createBatch,
  updateBatch
} from "../controllers/academicsController.js";
import {
  getAttendanceOverview,
  getAttendanceReports,
  getShortageList,
  getStudentWiseAttendance,
  adminOverrideAttendance
} from "../controllers/adminAttendanceController.js";
import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  publishResults,
  getMarks,
  getResults,
  generateExamAnalysis
} from "../controllers/examsController.js";
import {
  getFeeStructures,
  createFeeStructure,
  getPayments,
  recordPayment,
  getFinancialSummary
} from "../controllers/feeController.js";
import {
  getAnnouncements,
  createAnnouncement,
  getMessages,
  sendMessage
} from "../controllers/communicationController.js";
import {
  getNaacDocuments,
  uploadNaacDocument,
  updateDocumentStatus,
  getComplianceStats
} from "../controllers/naacController.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";
import {
  assignTeacher,
  assignStudentToBatch,
  removeTeacherAssignment,
  getAssignments
} from "../controllers/adminAssignmentController.js";
import {
  createTimetableEntry,
  getFullTimetable,
  getConflicts
} from "../controllers/timetableController.js";

const router = express.Router();
const uploadCsv = multer({ dest: "uploads/temp/" });

// All routes require protection and Admin authorization (uppercase normalized in middleware)
router.use(protect);
router.use(authorize("COLLEGE_ADMIN", "SUPER_ADMIN"));

// Modules Registry
// -------------------------------------------------------------

// Dashboard Stats
router.get("/stats", getDashboardStats);

// Module 0: Academic Assignments
router.get("/assignments", getAssignments);
router.post("/assign-teacher", assignTeacher);
router.delete("/assign-teacher", removeTeacherAssignment);
router.post("/assign-student-batch", assignStudentToBatch);

// Module 1: Admissions
router.post("/enquiries", createEnquiry);
router.get("/enquiries", getEnquiries);
router.put("/enquiries/:id", updateEnquiryStatus);

router.post("/applications", submitApplication);
router.get("/applications", getApplications);
router.put("/applications/:id", updateApplicationStatus);
router.post("/applications/enroll", enrollStudent);

router.get("/admissions/reports", getAdmissionsReport);

// Module 2: SIS (Student Information System)
router.get("/students", getStudents);
router.get("/students/:id", getStudentById);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", softDeleteStudent);
router.post("/students/bulk-import", uploadCsv.single("file"), bulkImportStudents);
router.put("/students/:id/status", updateStudentStatus);

// Module 3: Faculty Management
router.get("/faculty", getFaculties);
router.get("/faculty/:id", getFacultyById);
router.post("/faculty", createFaculty);
router.put("/faculty/:id", updateFaculty);
router.delete("/faculty/:id", softDeleteFaculty);
router.put("/faculty/:id/assign", assignSubjects);

// Module 4: Academics
router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);

router.get("/subjects", getSubjects);
router.post("/subjects", createSubject);

router.get("/batches", getBatches);
router.post("/batches", createBatch);
router.put("/batches/:id", updateBatch);

// Module 5: Attendance
router.get("/attendance/overview", getAttendanceOverview);
router.get("/attendance/reports", getAttendanceReports);
router.get("/attendance/shortage", getShortageList);
router.get("/attendance/student-wise", getStudentWiseAttendance);
router.put("/attendance/override", adminOverrideAttendance);

// Module 6: Exams & Results
router.get("/exams", getExams);
router.get("/exams/:examId", getExamById);
router.post("/exams", createExam);
router.put("/exams/:examId", updateExam);
router.post("/exams/:examId/publish", publishResults);
router.get("/exams/:examId/marks", getMarks);
router.get("/results", getResults);
router.get("/exams/reports/analysis", generateExamAnalysis);

// Module 7: Fee Management
router.get("/fees/structures", getFeeStructures);
router.post("/fees/structures", createFeeStructure);
router.get("/fees/payments", getPayments);
router.post("/fees/payments", recordPayment);
router.get("/fees/summary", getFinancialSummary);

// Module 8: Communication
router.get("/communication/announcements", getAnnouncements);
router.post("/communication/announcements", createAnnouncement);
router.get("/communication/messages", getMessages);
router.post("/communication/messages", sendMessage);

// Module 9: NAAC Compliance
router.get("/naac/documents", getNaacDocuments);
router.post("/naac/documents", uploadNaacDocument);
router.put("/naac/documents/:id/status", updateDocumentStatus);
router.get("/naac/stats", getComplianceStats);

// Module 10: Timetable
router.get("/timetable", getFullTimetable);
router.post("/timetable", createTimetableEntry);
router.get("/timetable/conflicts", getConflicts);

export default router;
