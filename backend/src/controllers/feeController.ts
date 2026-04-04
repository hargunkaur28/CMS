import { Request, Response } from "express";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { generateReceiptNo } from "../utils/generateReceiptNo.js";

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    let query: any = {};

    if (collegeId) {
      const courses = await Course.find({ collegeId }).select("_id");
      query.courseId = { $in: courses.map((course) => course._id) };
    }

    const structures = await FeeStructure.find(query).populate("courseId");
    res.status(200).json({ success: true, data: structures });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    if (collegeId) {
      const targetCourse = await Course.findOne({ _id: req.body.courseId, collegeId }).select("_id");
      if (!targetCourse) {
        return res.status(400).json({ success: false, message: "Selected course is not available for this college" });
      }
    }

    const structure = new FeeStructure(req.body);
    await structure.save();
    res.status(201).json({ success: true, data: structure });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { status, studentId } = req.query;
    const collegeId = (req as any).user?.collegeId;
    let query: any = {};
    if (status) query.status = status;

    if (collegeId) {
      const collegeStudents = await Student.find({ collegeId }).select("_id");
      query.studentId = { $in: collegeStudents.map((student) => student._id) };
    }

    if (studentId) {
      if (query.studentId?.$in) {
        const allowed = (query.studentId.$in as any[]).map((id) => String(id));
        if (!allowed.includes(String(studentId))) {
          return res.status(200).json({ success: true, data: [] });
        }
      }
      query.studentId = studentId;
    }

    const payments = await Payment.find(query)
      .populate("studentId", "personalInfo.firstName personalInfo.lastName personalInfo.name uniqueStudentId")
      .populate("feeStructureId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, feeStructureId, amount, method, transactionId } = req.body;
    const userRole = (req as any).user?.role;
    const userCollegeId = (req as any).user?.collegeId;
    
    // For college admins, verify student belongs to their college
    if (userRole === 'COLLEGE_ADMIN' && userCollegeId) {
      const student = await Student.findOne({ _id: studentId, collegeId: userCollegeId });
      if (!student) {
        return res.status(403).json({ success: false, message: "Student not found in your college" });
      }
    }
    
    const receiptNo = generateReceiptNo();
    
    const payment = new Payment({
      studentId,
      feeStructureId,
      amountPaid: amount,
      mode: method,
      transactionId,
      receiptNumber: receiptNo,
      status: "Paid",
      paymentDate: new Date(),
      fineApplied: 0,
    });

    await payment.save();

    // Update student fee status (logic to be refined based on total dues)
    
    res.status(201).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    let scopedStudentIds: any[] = [];
    if (collegeId) {
      const students = await Student.find({ collegeId }).select("_id");
      scopedStudentIds = students.map((student) => student._id);
    }

    const paymentScopeMatch: any = { status: { $in: ["Paid", "COMPLETED"] } };
    if (scopedStudentIds.length > 0) {
      paymentScopeMatch.studentId = { $in: scopedStudentIds };
    }

    const totalCollected = await Payment.aggregate([
      { $match: paymentScopeMatch },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amountPaid", "$amount"] } } } }
    ]);

    const stats = totalCollected[0] || { total: 0 };
    
    // Calculate total expected based on student count * average fee (rough estimate for now)
    const studentCount = await Student.countDocuments({
      ...(collegeId ? { collegeId } : {}),
      "academicInfo.status": "active",
    });

    const pendingPaymentQuery: any = { status: { $in: ["Pending", "PENDING"] } };
    if (scopedStudentIds.length > 0) {
      pendingPaymentQuery.studentId = { $in: scopedStudentIds };
    }
    const pendingCount = await Payment.countDocuments(pendingPaymentQuery);
    const estimatedTotalExpected = studentCount * 45000; // Assuming 45k avg fee
    const efficiency = estimatedTotalExpected > 0 
      ? ((stats.total / estimatedTotalExpected) * 100).toFixed(1) + "%"
      : "0%";

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: stats.total || 0,
        pendingPayments: pendingCount,
        collectionEfficiency: efficiency,
        scholarshipFund: 14850000 // Real static endowment value for now, could be in DB
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
