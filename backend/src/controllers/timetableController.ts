import { Request, Response } from 'express';
import Timetable from '../models/Timetable.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new timetable entry
 * @route   POST /api/admin/timetable
 * @access  Private (Admin)
 */
export const createTimetableEntry = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      subjectId,
      batchId,
      classId,
      section,
      room,
      dayOfWeek,
      period,
      startTime,
      endTime,
      academicYear
    } = req.body;

    const collegeId = (req as any).user?.collegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College ID is required for timetable entry' });
    }

    // 1. CONFLICT CHECK before insert
    const conflict = await Timetable.findOne({
      collegeId,
      teacherId,
      dayOfWeek,
      period,
      academicYear,
      isActive: true
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: "Conflict detected",
        message: "Teacher already has a class at this time slot"
      });
    }

    // 2. Create entry
    const newEntry = await Timetable.create({
      collegeId,
      teacherId,
      subjectId,
      batchId,
      classId,
      section,
      room,
      dayOfWeek,
      period,
      startTime,
      endTime,
      academicYear
    });

    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error: any) {
    console.error('[CREATE_TIMETABLE]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get full timetable for admin
 * @route   GET /api/admin/timetable
 * @access  Private (Admin)
 */
export const getFullTimetable = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    const { academicYear, teacherId } = req.query;

    const query: any = { collegeId, isActive: true };
    if (academicYear) query.academicYear = academicYear;
    if (teacherId && teacherId !== 'undefined') query.teacherId = teacherId;

    const timetable = await Timetable.find(query)
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .populate('classId', 'name')
      .sort({ period: 1 });

    // Group by dayOfWeek -> period -> entries[]
    const groupedData = timetable.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const period = entry.period;
      
      if (!acc[day]) acc[day] = {};
      if (!acc[day][period]) acc[day][period] = [];
      
      acc[day][period].push(entry);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedData
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all timetable conflicts
 * @route   GET /api/admin/timetable/conflicts
 * @access  Private (Admin)
 */
export const getConflicts = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;

    // Aggregate to find duplicates at the same slot
    const conflicts = await Timetable.aggregate([
      { $match: { collegeId: new mongoose.Types.ObjectId(collegeId), isActive: true } },
      {
        $group: {
          _id: {
            teacherId: '$teacherId',
            dayOfWeek: '$dayOfWeek',
            period: '$period',
            academicYear: '$academicYear'
          },
          count: { $sum: 1 },
          docs: { $push: '$$ROOT' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: conflicts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get teacher's full weekly timetable
 * @route   GET /api/teacher/timetable
 * @access  Private (Teacher)
 */
export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    if (!teacherId || !collegeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const timetable = await Timetable.find({ 
      collegeId, 
      teacherId, 
      isActive: true 
    })
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .sort({ period: 1 });

    // Group by dayOfWeek -> period -> entries[]
    const grouped = timetable.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const period = entry.period;
      
      if (!acc[day]) acc[day] = {};
      if (!acc[day][period]) acc[day][period] = [];
      
      acc[day][period].push(entry);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get teacher's timetable for today
 * @route   GET /api/teacher/timetable/today
 * @access  Private (Teacher)
 */
export const getTodaySchedule = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    if (today === 'Sunday') {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No classes scheduled for Sunday'
      });
    }

    const timetable = await Timetable.find({ 
      collegeId,
      teacherId, 
      dayOfWeek: today,
      isActive: true
    })
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .sort({ period: 1 });

    // Add isUpcoming flag (startTime > now)
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const enrichedTimetable = timetable.map((entry: any) => {
      const entryObj = entry.toObject();
      return {
        ...entryObj,
        isUpcoming: entry.startTime > currentTimeStr
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedTimetable
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get student's full weekly timetable (by batch)
 * @route   GET /api/student/timetable
 * @access  Private (Student)
 */
export const getStudentTimetable = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    if (!userId || !collegeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const student = await Student.findOne({ userId, collegeId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    let batchId = student.batchId;

    // FALLBACK: If batchId is missing, lookup by name from academicInfo
    if (!batchId && student.academicInfo?.batch) {
      console.log(`[TIMETABLE FALLBACK] Resolving batch for student ${student._id} via name: ${student.academicInfo.batch}`);
      const resolvedBatch = await Batch.findOne({ 
        name: student.academicInfo.batch,
        collegeId 
      });
      if (resolvedBatch) batchId = resolvedBatch._id;
    }

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Student is not assigned to a valid batch' });
    }

    const timetable = await Timetable.find({ 
      collegeId, 
      batchId,
      isActive: true 
    })

      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ period: 1 });

    const results = await Timetable.find({ 
      collegeId, 
      batchId: student.batchId,
      isActive: true 
    })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ period: 1 });

    // Group by dayOfWeek -> period -> entries[]
    const grouped = results.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const period = entry.period;
      
      if (!acc[day]) acc[day] = {};
      if (!acc[day][period]) acc[day][period] = [];
      
      acc[day][period].push(entry);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get student's timetable for today
 * @route   GET /api/student/timetable/today
 * @access  Private (Student)
 */
export const getStudentTodaySchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    if (today === 'Sunday') {
      return res.status(200).json({ success: true, data: [] });
    }

    const student = await Student.findOne({ userId, collegeId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    
    let batchId = student.batchId;

    // FALLBACK: Lookup by name
    if (!batchId && student.academicInfo?.batch) {
       const resolvedBatch = await Batch.findOne({ name: student.academicInfo.batch, collegeId });
       if (resolvedBatch) batchId = resolvedBatch._id;
    }

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Student is not assigned to a valid batch' });
    }

    const timetable = await Timetable.find({ 
      collegeId,
      batchId,
      dayOfWeek: today,
      isActive: true
    })


      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ period: 1 });

    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const enriched = timetable.map((entry: any) => ({
      ...entry.toObject(),
      isUpcoming: entry.startTime > currentTimeStr
    }));

    res.status(200).json({
      success: true,
      data: enriched
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
