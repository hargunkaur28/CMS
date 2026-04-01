import { Request, Response } from 'express';
import Timetable from '../models/Timetable.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import mongoose from 'mongoose';
import { TIME_SLOTS, getSlotByStartTime } from '../constants/timeSlots.js';

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
      startTime,
      academicYear
    } = req.body;

    const collegeId = (req as any).user?.collegeId;

    if (!collegeId) {
      return res.status(400).json({ success: false, message: 'College ID is required for timetable entry' });
    }

    const slot = getSlotByStartTime(startTime);
    if (!slot) {
      return res.status(400).json({
        success: false,
        message: `Invalid start time "${startTime}". Must be one of: ${TIME_SLOTS.map(s => s.start).join(', ')}`
      });
    }
    const period = slot.period;
    const endTime = slot.end;

    const teacherConflict = await Timetable.findOne({
      collegeId,
      teacherId,
      dayOfWeek,
      startTime: slot.start,
      academicYear,
      isActive: true
    });

    if (teacherConflict) {
      return res.status(409).json({
        success: false,
        error: "Teacher Conflict",
        message: `Teacher already has a class on ${dayOfWeek} at ${slot.label} (Period ${period})`
      });
    }

    const batchConflict = await Timetable.findOne({
      collegeId,
      batchId,
      section,
      dayOfWeek,
      startTime: slot.start,
      academicYear,
      isActive: true
    });

    if (batchConflict) {
      return res.status(409).json({
        success: false,
        error: "Batch Conflict",
        message: `Batch ${batchId} Section ${section} already has a class scheduled on ${dayOfWeek} at ${slot.label}`
      });
    }

    const newEntry = await Timetable.create({
      collegeId,
      teacherId,
      subjectId,
      batchId,
      classId,
      section,
      room,
      dayOfWeek,
      period: Number(period),
      startTime: slot.start,
      endTime: String(endTime),
      academicYear
    });

    res.status(201).json({
      success: true,
      data: newEntry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get full timetable for admin
 */
export const getFullTimetable = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    const { academicYear, teacherId } = req.query;

    const query: any = { collegeId, isActive: true };
    if (academicYear) query.academicYear = academicYear;
    if (teacherId && teacherId !== 'undefined') query.teacherId = teacherId;

    const results = await Timetable.find(query)
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .populate('classId', 'name')
      .sort({ period: 1 });

    const groupedData = results.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const start = (entry.startTime || '').trim();
      if (!acc[day]) acc[day] = {};
      if (!acc[day][start]) acc[day][start] = [];
      acc[day][start].push(entry);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: groupedData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all timetable conflicts
 */
export const getConflicts = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
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
    res.status(200).json({ success: true, data: conflicts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get teacher's full weekly timetable
 */
export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    if (!teacherId || !collegeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const timetable = await Timetable.find({ collegeId, teacherId, isActive: true })
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .sort({ period: 1 });

    const grouped = timetable.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const start = (entry.startTime || '').trim();
      if (!acc[day]) acc[day] = {};
      if (!acc[day][start]) acc[day][start] = [];
      acc[day][start].push(entry);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: grouped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get teacher's timetable for today
 */
export const getTodaySchedule = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    if (today === 'Sunday') {
      return res.status(200).json({ success: true, data: [], message: 'No classes scheduled for Sunday' });
    }

    const timetable = await Timetable.find({ collegeId, teacherId, dayOfWeek: today, isActive: true })
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .sort({ period: 1 });

    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const enrichedTimetable = timetable.map((entry: any) => ({
      ...entry.toObject(),
      isUpcoming: entry.startTime > currentTimeStr
    }));

    res.status(200).json({ success: true, data: enrichedTimetable });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get student's full weekly timetable
 */
export const getStudentTimetable = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;
    if (!userId || !collegeId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const student = await Student.findOne({ userId, collegeId });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    let batchId = student.batchId;
    if (!batchId && student.academicInfo?.batch) {
      const resolvedBatch = await Batch.findOne({ name: student.academicInfo.batch, collegeId });
      if (resolvedBatch) batchId = resolvedBatch._id;
    }

    if (!batchId) return res.status(400).json({ success: false, message: 'Student is not assigned to a valid batch' });

    const query: any = { collegeId, batchId, isActive: true };
    if (student.academicInfo?.section) query.section = student.academicInfo.section;

    const results = await Timetable.find(query)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ period: 1 });

    const grouped = results.reduce((acc: any, entry: any) => {
      const day = entry.dayOfWeek;
      const start = (entry.startTime || '').trim();
      if (!acc[day]) acc[day] = {};
      if (!acc[day][start]) acc[day][start] = [];
      acc[day][start].push(entry);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: grouped });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTimeSlots = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: TIME_SLOTS });
};

export const deleteTimetableEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collegeId = (req as any).user?.collegeId;
    const entry = await Timetable.findOneAndDelete({ _id: id, collegeId });
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.status(200).json({ success: true, message: 'Entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTimetableEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collegeId = (req as any).user?.collegeId;
    const entry = await Timetable.findOneAndUpdate({ _id: id, collegeId }, req.body, { new: true })
      .populate('teacherId', 'name email')
      .populate('subjectId', 'name code')
      .populate('batchId', 'name');
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.status(200).json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentTodaySchedule = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    if (today === 'Sunday') return res.status(200).json({ success: true, data: [] });
    const student = await Student.findOne({ userId, collegeId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    let batchId = student.batchId;
    if (!batchId && student.academicInfo?.batch) {
       const resolvedBatch = await Batch.findOne({ name: student.academicInfo.batch, collegeId });
       if (resolvedBatch) batchId = resolvedBatch._id;
    }
    if (!batchId) return res.status(400).json({ success: false, message: 'Student is not assigned to a valid batch' });
    const query: any = { collegeId, batchId, dayOfWeek: today, isActive: true };
    if (student.academicInfo?.section) query.section = student.academicInfo.section;
    const results = await Timetable.find(query)
      .populate('subjectId', 'name code')
      .populate('teacherId', 'name email')
      .sort({ period: 1 });
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const enriched = results.map((entry: any) => ({
      ...entry.toObject(),
      isUpcoming: entry.startTime > currentTimeStr
    }));
    res.status(200).json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
