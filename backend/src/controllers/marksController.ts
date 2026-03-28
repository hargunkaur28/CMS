import { Request, Response } from 'express';
import Marks from '../models/Marks.js';
import Exam from '../models/Exam.js';

/**
 * @desc    List assigned exams for teacher
 * @route   GET /api/teacher/marks/exams
 * @access  Private (Teacher)
 */
export const getAssignedExams = async (req: Request, res: Response) => {
  try {
    // Logic to fetch exams where the teacher is assigned
    // For now, listing all active exams as a placeholder
    const exams = await Exam.find({ status: 'active' });
    res.status(200).json({ success: true, data: exams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Enter marks for a class/subject
 * @route   POST /api/teacher/marks/enter
 * @access  Private (Teacher)
 */
export const enterMarks = async (req: Request, res: Response) => {
  try {
    const { examId, studentId, subjectId, marksObtained, maxMarks, remarks } = req.body;
    const teacherId = req.user._id;

    if (marksObtained > maxMarks) {
      return res.status(400).json({ success: false, message: 'Marks obtained cannot exceed max marks' });
    }

    // Check if marks already exist
    const existing = await Marks.findOne({ examId, studentId, subjectId });
    if (existing) {
       return res.status(400).json({ success: false, message: 'Marks already entered for this student' });
    }

    const marks = await Marks.create({
      examId,
      studentId,
      subjectId,
      teacherId,
      marksObtained,
      maxMarks,
      remarks
    });

    res.status(201).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get entered marks for an exam
 * @route   GET /api/teacher/marks/:examId
 * @access  Private (Teacher)
 */
export const getMarksByExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user._id;

    const marks = await Marks.find({ examId, teacherId })
      .populate('studentId', 'name rollNumber')
      .populate('subjectId', 'name');

    res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Edit marks before publication
 * @route   PUT /api/teacher/marks/:markId
 * @access  Private (Teacher)
 */
export const editMarks = async (req: Request, res: Response) => {
  try {
    const { markId } = req.params;
    const { marksObtained, remarks } = req.body;
    const teacherId = req.user._id;

    const marks = await Marks.findById(markId);

    if (!marks) {
      return res.status(404).json({ success: false, message: 'Marks record not found' });
    }

    if (marks.teacherId.toString() !== teacherId.toString()) {
       return res.status(403).json({ success: false, message: 'Not authorized to edit these marks' });
    }

    if (marks.isPublished) {
      return res.status(403).json({ success: false, message: 'Cannot edit marks after result publication' });
    }

    if (marksObtained > marks.maxMarks) {
      return res.status(400).json({ success: false, message: 'Marks obtained cannot exceed max marks' });
    }

    marks.marksObtained = marksObtained;
    marks.remarks = remarks;
    await marks.save();

    res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
