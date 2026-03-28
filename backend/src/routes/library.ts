import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as libraryController from "../controllers/libraryController.js";

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/library
 * @desc    Get all books (Catalog search)
 */
router.get("/", libraryController.getBooks);

/**
 * @route   POST /api/library
 * @desc    Add a brand new title to the system
 * @access  Admin, Librarian, Staff
 */
router.post("/", authorize("SUPER_ADMIN", "COLLEGE_ADMIN", "TEACHER"), libraryController.addBook);

/**
 * @route   PUT /api/library/:id
 * @desc    Update a specific title or stock count
 * @access  Admin, Librarian, Staff
 */
router.put("/:id", authorize("SUPER_ADMIN", "COLLEGE_ADMIN", "TEACHER"), libraryController.updateBook);

/**
 * @route   DELETE /api/library/:id
 * @desc    Remove a specific title
 * @access  Admin, Librarian, Staff
 */
router.delete("/:id", authorize("SUPER_ADMIN", "COLLEGE_ADMIN"), libraryController.deleteBook);

export default router;
