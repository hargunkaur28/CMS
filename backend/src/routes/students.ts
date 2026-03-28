// FILE: backend/src/routes/students.ts
import express from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  bulkImportStudents,
  uploadStudentPhoto,
  getStudentStats,
  uploadDocs,
  getMyStudent,
} from "../controllers/studentsController.js";
import { protect } from "../middleware/auth.js";
import { uploadPhoto, uploadDocument } from "../utils/cloudinaryUploader.js";
import multer from "multer";

const router = express.Router();
console.log("STUDENT ROUTER INITIALIZED");
router.use((req, res, next) => {
  console.log(`[STUDENT ROUTER] ${req.method} ${req.url}`);
  next();
});
const uploadCsv = multer({ dest: "uploads/temp/" }); // Direct multer for CSV

// --- Directory & Stats ---
router.get("/me", protect, getMyStudent);
router.get("/", getStudents);
router.get("/stats", getStudentStats);
router.get("/:id", getStudentById);

// --- CRUD ---
router.post("/", createStudent);
router.patch("/:id", updateStudent);

// --- Imports & Media ---
router.post("/import", uploadCsv.single("file"), bulkImportStudents);
router.post("/:id/photo", uploadPhoto.single("photo"), uploadStudentPhoto);
router.post("/upload-docs", uploadDocument.array("files", 5), uploadDocs);

export default router;
