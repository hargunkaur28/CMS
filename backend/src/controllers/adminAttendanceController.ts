import { Request, Response } from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";

export const getAttendanceOverview = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userCollegeId = (req as any).user?.collegeId;
    
    const matchStage: any = { $unwind: "$records" };
    const groupStage: any = {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] } },
        leave: { $sum: { $cond: [{ $eq: ["$records.status", "Leave"] }, 1, 0] } }
      }
    };
    
    const pipeline: any[] = [matchStage, groupStage];
    
    // For college admins, enforce their collegeId
    if (userRole === 'COLLEGE_ADMIN' && userCollegeId) {
      pipeline.unshift({ $match: { collegeId: userCollegeId } });
    }
    
    const totalRecords = await Attendance.aggregate(pipeline);

    const stats = totalRecords[0] || { totalStudents: 0, present: 0, absent: 0, leave: 0 };
    const total = stats.totalStudents || 1; // Prevent div/0
    
    res.status(200).json({
      success: true,
      data: {
        totalRecords: await Attendance.countDocuments(
          userRole === 'COLLEGE_ADMIN' && userCollegeId ? { collegeId: userCollegeId } : {}
        ),
        stats: {
           totalStudents: stats.totalStudents,
           presentPercentage: ((stats.present / total) * 100).toFixed(1),
           absentPercentage: ((stats.absent / total) * 100).toFixed(1),
           leavePercentage: ((stats.leave / total) * 100).toFixed(1)
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceReports = async (req: Request, res: Response) => {
  try {
    const { batchId, courseId, startDate, endDate } = req.query;
    const userRole = (req as any).user?.role;
    const userCollegeId = (req as any).user?.collegeId;
    
    let query: any = {};
    
    // For college admins, enforce their collegeId
    if (userRole === 'COLLEGE_ADMIN' && userCollegeId) {
      query.collegeId = userCollegeId;
    }
    
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
          student: "$_id",
          totalClasses: 1,
          presentClasses: 1,
          percentage: { $multiply: [{ $divide: ["$presentClasses", "$totalClasses"] }, 100] }
        }
      },
      { $match: { percentage: { $lt: Number(threshold) } } }
    ]);

    // Populate student details
    const populatedStats = await Student.populate(stats, { path: "student", select: "personalInfo.name studentId uniqueStudentId academicInfo" });

    const result = populatedStats.map((s: any) => ({
      ...s,
      personalInfo: s.student?.personalInfo,
      academicInfo: s.student?.academicInfo,
      studentId: s.student?.studentId || s.student?.uniqueStudentId || "N/A",
      _id: s.student?._id || s.student // Use student._id as the primary key for the frontend
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentWiseAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId, section, subjectId } = req.query;
    
    // Base match for the attendance collection
    const matchQuery: any = {};
    if (batchId) matchQuery.classId = new mongoose.Types.ObjectId(batchId as string);
    if (subjectId) matchQuery.subjectId = new mongoose.Types.ObjectId(subjectId as string);
    // Note: section filtering requires fetching Batch details or Student details

    const stats = await Attendance.aggregate([
      { $match: matchQuery },
      { $unwind: "$records" },
      {
        $group: {
          _id: "$records.studentId",
          totalClasses: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$records.status", "Absent"] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ["$records.status", "Leave"] }, 1, 0] } }
        }
      },
      {
        $project: {
          student: "$_id",
          totalClasses: 1,
          present: 1,
          absent: 1,
          leave: 1,
          percentage: { $multiply: [{ $divide: ["$present", "$totalClasses"] }, 100] }
        }
      },
      { $sort: { percentage: -1 } }
    ]);

    const populatedStats = await Student.populate(stats, { 
       path: "student", 
       select: "personalInfo.name studentId uniqueStudentId academicInfo.rollNumber" 
    });

    const result = populatedStats.map((s: any) => ({
      ...s,
      personalInfo: s.student?.personalInfo,
      academicInfo: s.student?.academicInfo,
      studentId: s.student?.studentId || s.student?.uniqueStudentId || "N/A",
      _id: s.student?._id || s.student // Use student ID as the primary key for the frontend
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminOverrideAttendance = async (req: Request, res: Response) => {
   try {
     const { recordId, studentId, newStatus, reason } = req.body;
     
     // Log the audit reason (could save to a new AuditLog collection in a real app)
     console.log(`[AUDIT] Admin override applied on Attendance ${recordId} for student ${studentId}. Reason: ${reason}`);

     const attendance = await Attendance.findOneAndUpdate(
       { _id: recordId, "records.studentId": studentId },
       { $set: { "records.$.status": newStatus } },
       { new: true }
     );

     if (!attendance) return res.status(404).json({ success: false, message: "Record not found" });
     
     res.status(200).json({ success: true, data: attendance });
   } catch (error: any) {
     res.status(500).json({ success: false, message: error.message });
   }
};
