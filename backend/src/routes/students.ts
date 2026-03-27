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
} from "../controllers/studentsController.js";
import { uploadPhoto, uploadDocument } from "../utils/cloudinaryUploader.js";
import multer from "multer";

const router = express.Router();
const uploadCsv = multer({ dest: "uploads/temp/" }); // Direct multer for CSV

// --- Directory & Stats ---
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
