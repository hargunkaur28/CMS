import { Request, Response } from 'express';
import Timetable from '../models/Timetable.js';

/**
 * @desc    Get teacher's full weekly timetable
 * @route   GET /api/teacher/timetable
 * @access  Private (Teacher)
 */
export const getTimetable = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user._id;
    const timetable = await Timetable.find({ teacherId })
      .populate('subjectId', 'name code')
      .populate('classId', 'name section') // Assuming Batch might be used as Class
      .sort({ dayOfWeek: 1, period: 1 });

    res.status(200).json({
      success: true,
      data: timetable
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
export const getTodayTimetable = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user._id;
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
      teacherId, 
      dayOfWeek: today 
    })
      .populate('subjectId', 'name code')
      .populate('classId', 'name section')
      .sort({ period: 1 });

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
