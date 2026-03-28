// FILE: backend/src/controllers/attendanceController.ts
import { Request, Response } from 'express';
import Attendance from '../models/Attendance.js';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import mongoose from 'mongoose';
import { emitToBatch } from '../config/socket.js';

/**
 * @desc    Mark attendance for a class (Legacy)
 */
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { classId, subjectId, date, records } = req.body;
    const teacherId = (req as any).user?._id;

    const existingDate = new Date(date);
    existingDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.create({
      teacherId,
      classId,
      subjectId,
      date: existingDate,
      records
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark attendance in bulk (Modern)
 * @route   POST /api/attendance/bulk
 */
export const markBulkAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id?.toString();
    const { batchId, subjectId, date, records } = req.body;

    if (!teacherId || (req as any).user?.role !== "TEACHER") {
      return res.status(403).json({ success: false, message: 'Only teachers can mark attendance.' });
    }

    // 1. Authorization: verify teacher is assigned to this batch+subject
    const faculty = await Faculty.findOne({ userId: teacherId });
    
    if (!faculty || !faculty.assignedSubjects?.length) {
      console.warn(`[ATTENDANCE][DENY] Faculty profile not found or empty for User: ${teacherId}`);
      return res.status(403).json({ success: false, message: 'No teaching assignments found. Contact admin.' });
    }

    // 2. Tenant Isolation: Ensure same college
    if (faculty.collegeId?.toString() !== (req as any).user?.collegeId?.toString()) {
       console.error(`[ATTENDANCE][DENY] Cross-college access attempt by ${teacherId}`);
       return res.status(403).json({ success: false, message: 'Cross-college access denied.' });
    }

    // 3. Strict Assignment Check (ID Normalization)
    const normalizedSubjectId = subjectId?.toString();
    const normalizedBatchId = batchId?.toString();

    const isAuthorized = faculty.assignedSubjects.some((a: any) => 
      a.subjectId?.toString() === normalizedSubjectId && 
      a.batchId?.toString() === normalizedBatchId
    );

    if (!isAuthorized) {
      console.warn("[ATTENDANCE][DENY] Unauthorized mapping attempt:", {
        teacherId, subjectId: normalizedSubjectId, batchId: normalizedBatchId,
        assigned: faculty.assignedSubjects.map((a: any) => ({ s: a.subjectId?.toString(), b: a.batchId?.toString() }))
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: You are not assigned to this subject/batch combination.' 
      });
    }

    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { classId: batchId, subjectId, date: sessionDate },
      { teacherId, records },
      { upsert: true, new: true }
    );

    // Emit real-time notification to the batch room
    emitToBatch(batchId, "attendanceUpdated", { 
      batchId, 
      subjectId, 
      date: sessionDate,
      count: records.length 
    });

    res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    if (error.code === 11000) {
      const sessionDate = new Date(req.body.date);
      sessionDate.setHours(0, 0, 0, 0);
      const existing = await Attendance.findOne({ 
        classId: req.body.batchId, 
        subjectId: req.body.subjectId, 
        date: sessionDate 
      });
      return res.status(200).json({ success: true, data: existing, message: "Handled duplicate entry" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get attendance records
 */
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { batchId, subjectId, date } = req.query;
    const query: any = {};
    if (batchId) query.classId = batchId;
    if (subjectId) query.subjectId = subjectId;
    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }

    const attendance = await Attendance.find(query)
      .populate('records.studentId', 'personalInfo academicInfo')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClassAttendance = async (req: Request, res: Response) => {
  return getAttendance(req, res);
};

/**
 * @desc    Get attendance stats for a batch
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const stats = await Attendance.aggregate([
      { $match: { classId: new mongoose.Types.ObjectId(batchId as string) } },
      { $unwind: "$records" },
      {
        $group: {
          _id: "$records.studentId",
          present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get dashboard stats
 */
export const getHubStats = async (req: Request, res: Response) => {
  try {
    const totalRecords = await Attendance.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecords = await Attendance.countDocuments({ date: today });

    res.status(200).json({ 
      success: true, 
      data: { totalRecords, todayRecords } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get today's schedule (Placeholders)
 */
export const getTodaySchedule = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [], message: "Schedule feature coming soon" });
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  // Simple implementation to satisfy routes
  res.status(200).json({ success: true, data: [] });
};

export const getShortageAlerts = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [] });
};

/**
 * @desc    Submit a leave request
 */
export const submitLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { fromDate, toDate, reason, studentId } = req.body;
    const leave = await mongoose.model('LeaveRequest').create({
      studentId, fromDate, toDate, reason, status: 'pending'
    });
    res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get leave requests
 */
export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const leaves = await mongoose.model('LeaveRequest').find()
      .populate('studentId', 'personalInfo academicInfo')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Review a leave request
 */
export const reviewLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const leave = await mongoose.model('LeaveRequest').findByIdAndUpdate(
      id, { status, remarks, reviewedAt: new Date() }, { new: true }
    );
    res.status(200).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get attendance for the logged in student
 */
export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });

    // 1. Find the student record(s) to fetch attendance for
    let studentId = null;

    if (user.role === 'PARENT') {
      const parent = await Parent.findOne({ userId: user._id });
      if (!parent || !parent.students.length) {
        return res.status(404).json({ success: false, message: "No linked students found for this parent" });
      }
      studentId = parent.students[0]; // Fetch for the first child by default in the list view
    } else {
      const student = await Student.findOne({ userId: user._id });
      if (!student) return res.status(404).json({ success: false, message: "Student profile not found" });
      studentId = student._id;
    }

    // 2. Fetch all attendance records where this student is present/absent
    const attendance = await Attendance.find({ 
      "records.studentId": studentId 
    })
    .populate('subjectId', 'name')
    .sort({ date: -1 });

    // 3. Filter the records array to only include this student's status for each day
    const myRecords = attendance.map(day => {
      const myRecord = day.records.find(r => r.studentId.toString() === studentId.toString());
      return {
        date: day.date,
        subject: day.subjectId,
        status: myRecord?.status || 'Absent'
      };
    }).filter(r => r.status !== undefined); // Only return records that actually exist

    // 4. Calculate Aggregates
    const total = myRecords.length;
    const present = myRecords.filter(r => r.status === 'Present').length;
    const leave = myRecords.filter(r => r.status === 'Leave').length; 
    const percentage = total > 0 ? Math.round(((present + leave) / total) * 100) : 0;

    // 5. Subject-Wise Breakdown (with lastMarkedAt for UI clarity)
    const subjectWiseMap: any = {};
    myRecords.forEach(r => {
      const subId = r.subject?._id?.toString() || 'unknown';
      const subName = (r.subject as any)?.name || 'Unknown Subject';
      
      if (!subjectWiseMap[subId]) {
        subjectWiseMap[subId] = { name: subName, total: 0, present: 0, leave: 0, lastMarkedAt: null };
      }
      subjectWiseMap[subId].total++;
      if (r.status === 'Present') subjectWiseMap[subId].present++;
      if (r.status === 'Leave') subjectWiseMap[subId].leave++;
      // Track the most recent date this subject had attendance
      const rDate = new Date(r.date).getTime();
      if (!subjectWiseMap[subId].lastMarkedAt || rDate > new Date(subjectWiseMap[subId].lastMarkedAt).getTime()) {
        subjectWiseMap[subId].lastMarkedAt = r.date;
      }
    });

    const subjectWise = Object.values(subjectWiseMap).map((sub: any) => ({
      ...sub,
      percentage: sub.total > 0 ? Math.round(((sub.present + sub.leave) / sub.total) * 100) : 0
    }));

    res.status(200).json({ 
      success: true, 
      data: {
        registrationId: user.registrationId,
        percentage,
        totalClasses: total,
        presentClasses: present,
        absentClasses: total - present - leave,
        records: myRecords,
        subjectWise
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
