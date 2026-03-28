import { Request, Response } from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';

/**
 * @desc    List students in teacher's classes
 * @route   GET /api/teacher/students
 * @access  Private (Teacher)
 */
export const getMyStudents = async (req: Request, res: Response) => {
  try {
    // In a real system, we'd query batches assigned to this teacher
    // For simplicity, listing all students but filtering fields
    const students = await Student.find()
      .select('name rollNumber batchId section semester profilePicture')
      .populate('userId', 'email isActive');

    res.status(200).json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get limited student profile
 * @route   GET /api/teacher/students/:studentId
 * @access  Private (Teacher)
 */
export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // Strict field selection to strip sensitive info
    const student = await Student.findById(studentId)
      .select('name rollNumber batchId section semester profilePicture academicHistory')
      .populate('userId', 'email name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
