import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as parentController from "../controllers/parentController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("PARENT"));

/**
 * @route   GET /api/parent/me/student
 * @desc    Get linked student profile
 */
router.get("/me/student", parentController.getMyStudentProfile);

/**
 * @route   GET /api/parent/me/attendance
 * @desc    Get linked student attendance
 */
router.get("/me/attendance", parentController.getMyStudentAttendance);

/**
 * @route   GET /api/parent/me/results
 * @desc    Get linked student results
 */
router.get("/me/results", parentController.getMyStudentResults);

export default router;
