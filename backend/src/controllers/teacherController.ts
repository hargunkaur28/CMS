// FILE: backend/src/controllers/teacherController.ts
import { Request, Response } from 'express';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

/**
 * @desc    Get only the batches this teacher is assigned to
 * @route   GET /api/teacher/my-batches
 */
export const getMyBatches = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const faculty = await Faculty.findOne({ userId: user._id })
      .populate('assignedSubjects.batchId', 'name year sections')
      .populate('assignedSubjects.subjectId', 'name code');

    if (!faculty || faculty.assignedSubjects.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'No batches assigned yet. Contact admin.' });
    }

    // Deduplicate batches
    const batchMap = new Map<string, any>();
    faculty.assignedSubjects.forEach((a: any) => {
      const b = a.batchId;
      if (b && !batchMap.has(b._id.toString())) {
        batchMap.set(b._id.toString(), b);
      }
    });

    res.status(200).json({ success: true, data: Array.from(batchMap.values()) });
  } catch (error: any) {
    console.error('[GET_MY_BATCHES]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get subjects this teacher is assigned to (optionally filtered by batchId)
 * @route   GET /api/teacher/my-subjects?batchId=xxx
 */
export const getMySubjects = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { batchId } = req.query;

    const faculty = await Faculty.findOne({ userId: user._id })
      .populate('assignedSubjects.subjectId', 'name code creditHours')
      .populate('assignedSubjects.batchId', 'name');

    if (!faculty) {
      return res.status(200).json({ success: true, data: [], message: 'No subjects assigned.' });
    }

    // Filter by batch if provided — STRICT approach with ID normalization
    const assignments = batchId
      ? faculty.assignedSubjects.filter((a: any) => {
          const bid = a.batchId?._id ? a.batchId._id.toString() : a.batchId?.toString();
          return bid === batchId.toString();
        })
      : faculty.assignedSubjects;

    const subjects = assignments
      .map((a: any) => a.subjectId)
      .filter(Boolean);

    console.log("[TEACHER_SUBJECTS]", {
      batchId: batchId || 'ALL',
      subjectsCount: subjects.length
    });

    res.status(200).json({ success: true, data: subjects });
  } catch (error: any) {
    console.error('[GET_MY_SUBJECTS]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get aggregated dashboard stats for authenticated teacher
 * @route   GET /api/teacher/dashboard
 */
export const getTeacherDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const faculty = await Faculty.findOne({ userId: user._id })
      .populate('assignedSubjects.batchId', 'name students')
      .populate('assignedSubjects.subjectId', 'name');

    if (!faculty) {
      return res.status(200).json({ success: true, data: { totalStudents: 0, assignedBatches: 0, assignedSubjects: 0 } });
    }

    // Calculate Unique Students across all batches (Avoiding double counting)
    const uniqueStudentIds = new Set<string>();
    const batchSet = new Set<string>();
    
    faculty.assignedSubjects.forEach((a: any) => {
      if (a.batchId) {
        batchSet.add(a.batchId._id.toString());
        if (Array.isArray(a.batchId.students)) {
          a.batchId.students.forEach((sid: any) => uniqueStudentIds.add(sid.toString()));
        }
      }
    });

    // Today's attendance sessions marked
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Attendance.countDocuments({
      teacherId: user._id,
      date: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUniqueStudents: uniqueStudentIds.size,
        assignedBatches: batchSet.size,
        assignedSubjects: faculty.assignedSubjects.length,
        todaySessionsMarked: todayCount,
        assignments: faculty.assignedSubjects.map((a: any) => ({
          subject: { 
            id: a.subjectId?._id || a.subjectId, 
            name: a.subjectId?.name || 'Unknown Subject' 
          },
          batch: { 
            id: a.batchId?._id || a.batchId, 
            name: a.batchId?.name || 'Unknown Batch' 
          }
        }))
      }
    });
  } catch (error: any) {
    console.error('[TEACHER_DASHBOARD]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Debug assignments for current teacher
 * @route   GET /api/teacher/debug-assignments
 */
export const getDebugAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const faculty = await Faculty.findOne({ userId: user._id });
    
    if (!faculty) {
      return res.status(200).json({ 
        teacherId: user._id,
        role: user.role,
        facultyProfile: null,
        message: 'No faculty profile found for this user.'
      });
    }

    res.status(200).json({
      teacherId: user._id,
      collegeId: faculty.collegeId,
      assignedSubjectsCount: faculty.assignedSubjects?.length || 0,
      assignedSubjects: faculty.assignedSubjects.map((a: any) => ({
        subjectId: a.subjectId,
        batchId: a.batchId,
        subjectId_type: typeof a.subjectId,
        batchId_type: typeof a.batchId
      })),
      rawFaculty: faculty
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
