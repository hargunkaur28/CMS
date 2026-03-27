// FILE: backend/src/controllers/attendanceController.ts
import { Request, Response } from "express";
import Attendance from "../models/Attendance.js";
import LeaveRequest from "../models/LeaveRequest.js";
import Student from "../models/Student.js";
import mongoose from "mongoose";

/**
 * Mark bulk attendance for a class
 * POST /api/attendance/bulk
 */
export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId, courseId, subjectId, teacherId, date, records } = req.body;

    // records: [{ studentId, status, remarks }]
    const operations = records.map((record: any) => ({
      updateOne: {
        filter: { 
          studentId: record.studentId, 
          subjectId, 
          date: new Date(date) 
        },
        update: {
          studentId: record.studentId,
          teacherId,
          subjectId,
          courseId,
          batchId,
          date: new Date(date),
          status: record.status,
          remarks: record.remarks,
          markedAt: new Date()
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.status(200).json({ 
      success: true, 
      message: `Attendance marked for ${records.length} students` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get attendance overview for a batch/subject
 * GET /api/attendance
 */
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId, subjectId, startDate, endDate } = req.query;
    const query: any = {};
    
    if (batchId) query.batchId = batchId;
    if (subjectId) query.subjectId = subjectId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const records = await Attendance.find(query)
      .populate("studentId", "personalInfo.firstName personalInfo.lastName uniqueStudentId")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Calculate attendance statistics and shortage alerts
 * GET /api/attendance/stats/:batchId
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const { subjectId } = req.query;

    const match: any = { batchId };
    if (subjectId) match.subjectId = subjectId;

    const stats = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$studentId",
          totalClasses: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          percentage: { 
            $multiply: [{ $divide: ["$presentCount", "$totalClasses"] }, 100] 
          }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      {
        $project: {
          studentId: "$_id",
          name: { $concat: ["$studentInfo.personalInfo.firstName", " ", "$studentInfo.personalInfo.lastName"] },
          uniqueId: "$studentInfo.uniqueStudentId",
          totalClasses: 1,
          presentCount: 1,
          percentage: { $round: ["$percentage", 2] },
          isShortage: { $lt: ["$percentage", 75] }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get simulated schedule for today (Quick Mark)
 * GET /api/attendance/schedule
 */
export const getTodaySchedule = async (req: Request, res: Response) => {
  try {
    // In a real system, this would query a 'Schedules' model.
    // Here we simulate it by picking 4 subjects from the system.
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: { batchId: "$batchId", subjectId: "$subjectId" },
          avgAttendance: { 
            $avg: { $cond: [{ $in: ["$status", ["present", "late"]] }, 100, 0] } 
          }
        }
      },
      { $limit: 4 },
      {
        $project: {
          batchId: "$_id.batchId",
          subjectId: "$_id.subjectId",
          avgAttendance: { $round: ["$avgAttendance", 0] }
        }
      }
    ]);

    // Fallback if no records exist yet
    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: [
          { batchId: "BTECH-CSE-2024", subjectId: "Data Structures", avgAttendance: 85 },
          { batchId: "BTECH-ECE-2024", subjectId: "Signals & Systems", avgAttendance: 72 }
        ]
      });
    }

    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Hub overview KPIs
 * GET /api/attendance/hub-stats
 */
export const getHubStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayMarked, totalStats, pendingLeaves] = await Promise.all([
      Attendance.countDocuments({ date: { $gte: today } }),
      Attendance.aggregate([
        {
          $group: {
            _id: null,
            avg: { $avg: { $cond: [{ $in: ["$status", ["present", "late"]] }, 100, 0] } }
          }
        }
      ]),
      LeaveRequest.countDocuments({ status: "pending" })
    ]);

    const avg = totalStats[0]?.avg || 0;

    res.status(200).json({
      success: true,
      data: {
        todayMarked,
        avgAttendance: Math.round(avg),
        pendingLeaves,
        shortageCount: 0 // Would require a complex aggregate, simplified for hub
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Leave Request Management
 */
export const submitLeaveRequest = async (req: Request, res: Response) => {
  try {
    const leave = new LeaveRequest(req.body);
    await leave.save();
    res.status(201).json({ success: true, data: leave, message: "Leave request submitted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { status, studentId } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    const leaves = await LeaveRequest.find(query)
      .populate("studentId", "personalInfo.firstName personalInfo.lastName uniqueStudentId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy, remarks } = req.body;

    const leave = await LeaveRequest.findByIdAndUpdate(
      id,
      { status, reviewedBy, remarks, reviewedAt: new Date() },
      { new: true }
    );

    if (!leave) return res.status(404).json({ success: false, message: "Request not found" });

    res.status(200).json({ success: true, data: leave, message: `Leave ${status}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
