import { Request, Response } from 'express';
import Marks from '../models/Marks.js';
import Exam from '../models/Exam.js';
import Faculty from '../models/Faculty.js';
import { syncSingleResult } from '../services/resultService.js';

/**
 * @desc    List assigned exams for teacher
 * @route   GET /api/teacher/marks/exams
 * @access  Private (Teacher)
 */
export const getAssignedExams = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    // Fetch teacher's assigned subjects
    const faculty = await Faculty.findOne({ userId: teacherId, collegeId });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    const assignedSubjectIds = faculty.assignedSubjects.map((a: any) => a.subjectId).filter(Boolean);

    // Filter exams to only those belonging to assigned subjects
    const exams = await Exam.find({
      collegeId,
      subjects: { $in: assignedSubjectIds },
      status: { $in: ['SCHEDULED', 'PUBLISHED'] }
    })
      .populate('subjects', 'name code')
      .sort({ scheduleDate: -1 });

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
    const { examId, studentId, subjectId, batchId, marksObtained, maxMarks, remarks } = req.body;
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    // 1. Normalize IDs to strings for comparison
    const teacherIdStr = teacherId.toString();
    const subjectIdStr = subjectId.toString();
    const batchIdStr = batchId.toString();

    // 2. Fetch teacher's assignments
    const faculty = await Faculty.findOne({ userId: teacherIdStr, collegeId });
    if (!faculty) {
      return res.status(403).json({ success: false, message: 'Faculty profile not found' });
    }

    // 3. Verify this subject+batch is assigned
    const isAuthorized = faculty.assignedSubjects.some(a => 
      a.subjectId.toString() === subjectIdStr && 
      a.batchId.toString() === batchIdStr
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You are not assigned to this subject and batch combination"
      });
    }

    if (marksObtained > maxMarks) {
      return res.status(400).json({ success: false, message: 'Marks obtained cannot exceed max marks' });
    }

    // Check if marks already exist
    const existing = await Marks.findOne({ examId, studentId, subjectId, collegeId });
    if (existing) {
       return res.status(400).json({ success: false, message: 'Marks already entered for this student' });
    }

    const marks = await Marks.create({
      collegeId,
      examId,
      studentId,
      subjectId,
      teacherId,
      marksObtained,
      maxMarks,
      remarks
    });

    // Centralized Sync to Result Collection
    const percentage = (marksObtained / maxMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    await syncSingleResult({
      type: 'EXAM',
      examId,
      studentId,
      subjectId,
      marksObtained,
      maxMarks,
      grade,
      gradePoint: percentage / 10,
      status: percentage >= 40 ? 'PASS' : 'FAIL', // Standard passing threshold
      collegeId,
      batchId,
      publishedBy: teacherId
    });

    res.status(201).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get entered marks for an exam (Scoped)
 * @route   GET /api/teacher/marks/:examId
 * @access  Private (Teacher)
 */
export const getMarksByExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    // Verify ownership or assignment if needed, but here we filter by teacherId
    const marks = await Marks.find({ collegeId, examId, teacherId })
      .populate('studentId', 'personalInfo academicInfo')
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
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    const marks = await Marks.findOne({ _id: markId, collegeId });

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

    // Centralized Sync to Result Collection
    const percentage = (marksObtained / marks.maxMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    await syncSingleResult({
      type: 'EXAM',
      examId: marks.examId,
      studentId: marks.studentId,
      subjectId: marks.subjectId,
      marksObtained,
      maxMarks: marks.maxMarks,
      grade,
      gradePoint: percentage / 10,
      status: percentage >= 40 ? 'PASS' : 'FAIL',
      collegeId,
      publishedBy: teacherId
    });

    res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
