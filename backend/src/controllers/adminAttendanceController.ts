import { Request, Response } from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";

export const getAttendanceOverview = async (req: Request, res: Response) => {
  try {
    const totalAttendances = await Attendance.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRecords: totalAttendances,
        todayCount: todayAttendance.length,
        averagePresent: "88%" // Placeholder for complex aggregation
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceReports = async (req: Request, res: Response) => {
  try {
    const { batchId, courseId, startDate, endDate } = req.query;
    let query: any = {};
    
    if (batchId) query.batchId = batchId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const report = await Attendance.find(query)
      .populate("teacherId", "name")
      .populate("subjectId", "name code")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShortageList = async (req: Request, res: Response) => {
  try {
    const { threshold = 75 } = req.query;
    
    // Aggregation pipeline to calculate attendance % per student
    const stats = await Attendance.aggregate([
      { $unwind: "$records" },
      {
        $group: {
          _id: "$records.studentId",
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          percentage: { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
        }
      },
      { $match: { percentage: { $lt: Number(threshold) } } }
    ]);

    // Populate student details
    const populatedStats = await Student.populate(stats, { path: "_id", select: "personalInfo.name studentId academic" });

    res.status(200).json({ success: true, data: populatedStats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
