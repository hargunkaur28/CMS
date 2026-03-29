import { Request, Response } from "express";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user.collegeId;
    
    const studentCount = await Student.countDocuments({ 
      collegeId, 
      "academicInfo.status": "active" 
    });
    const facultyCount = await Faculty.countDocuments({ 
      collegeId, 
      status: "Active" 
    });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { collegeId, status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Average attendance for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const attendanceStats = await Attendance.aggregate([
      { $match: { collegeId, date: { $gte: startOfMonth } } },
      { $unwind: "$records" },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } }
        }
      }
    ]);

    const avgAttendance = attendanceStats[0] 
      ? ((attendanceStats[0].present / attendanceStats[0].total) * 100).toFixed(1) + "%"
      : "0%";

    // Get real alerts
    const pendingEnquiries = await Student.countDocuments({ collegeId, "academicInfo.status": "enquiry" });
    const pendingApplications = await Student.countDocuments({ collegeId, "academicInfo.status": "applied" });
    const feeDefaulters = await Student.countDocuments({ collegeId, "academicInfo.feeStatus": "Overdue" });

    const alerts = [
      { title: "Verification Pending", detail: `${pendingApplications} applications need review`, time: "Just now" },
      { title: "New Enquiries", detail: `${pendingEnquiries} leads in the funnel`, time: "1h ago" },
      { title: "Fee Defaulters", detail: `${feeDefaulters} students have overdue fees`, time: "1d ago" }
    ];

    // At-Risk Students (Attendance < 75% or Overdue Fees)
    const atRiskCount = await Student.countDocuments({
      collegeId,
      $or: [
        { "academicInfo.attendancePercentage": { $lt: 75 } },
        { "academicInfo.feeStatus": "Overdue" }
      ]
    });

    // Top 3 At-Risk Students for the Warning System
    const atRiskStudents = await Student.find({
      collegeId,
      $or: [
        { "academicInfo.attendancePercentage": { $lt: 75 } },
        { "academicInfo.feeStatus": "Overdue" }
      ]
    })
    .select("personalInfo.name studentId academicInfo.attendancePercentage academicInfo.feeStatus")
    .limit(3);

    // Enrollment Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrend = await Student.aggregate([
      { $match: { collegeId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        revenue: totalRevenue[0]?.total || 0,
        avgAttendance,
        alerts,
        atRiskCount,
        atRiskStudents,
        enrollmentTrend
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
