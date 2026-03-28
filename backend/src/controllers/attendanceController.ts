import { Request, Response } from 'express';
import Attendance from '../models/Attendance.ts';

/**
 * @desc    Mark attendance for a class
 * @route   POST /api/teacher/attendance/mark
 * @access  Private (Teacher)
 */
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { classId, subjectId, date, records } = req.body;
    const teacherId = req.user._id;

    // Check for duplicate attendance (same class, subject, and date)
    const existingDate = new Date(date);
    existingDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      classId,
      subjectId,
      date: {
        $gte: existingDate,
        $lt: new Date(existingDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already marked for this class/subject on this date'
      });
    }

    const attendance = await Attendance.create({
      teacherId,
      classId,
      subjectId,
      date: existingDate,
      records
    });

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get attendance for a specific class
 * @route   GET /api/teacher/attendance/:classId
 * @access  Private (Teacher)
 */
export const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { subjectId } = req.query;

    const attendance = await Attendance.find({ 
      classId, 
      ...(subjectId && { subjectId }) 
    })
    .sort({ date: -1 })
    .populate('records.studentId', 'name rollNumber');

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get monthly attendance report
 * @route   GET /api/teacher/attendance/report/monthly
 * @access  Private (Teacher)
 */
export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const { classId, subjectId, month, year } = req.query;
    const teacherId = req.user._id;

    if (!month || !year) {
       return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0);

    const attendance = await Attendance.find({
      teacherId,
      ...(classId && { classId }),
      ...(subjectId && { subjectId }),
      date: { $gte: startDate, $lte: endDate }
    }).populate('records.studentId', 'name rollNumber');

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get students with attendance shortage (< 75%)
 * @route   GET /api/teacher/attendance/shortage
 * @access  Private (Teacher)
 */
export const getShortageAlerts = async (req: Request, res: Response) => {
  try {
    const { classId, subjectId } = req.query;
    const teacherId = req.user._id;

    // This would ideally use an aggregation pipeline for efficiency
    const attendances = await Attendance.find({
      teacherId,
      ...(classId && { classId }),
      ...(subjectId && { subjectId })
    });

    const studentStats: Record<string, { present: number, total: number, name: string }> = {};

    attendances.forEach(att => {
      att.records.forEach(rec => {
        const id = rec.studentId.toString();
        if (!studentStats[id]) {
          studentStats[id] = { present: 0, total: 0, name: '' };
        }
        studentStats[id].total += 1;
        if (rec.status === 'Present') studentStats[id].present += 1;
      });
    });

    const shortages = Object.entries(studentStats)
      .map(([id, stats]) => ({
        studentId: id,
        percentage: (stats.present / stats.total) * 100
      }))
      .filter(s => s.percentage < 75);

    res.status(200).json({
      success: true,
      data: shortages
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
