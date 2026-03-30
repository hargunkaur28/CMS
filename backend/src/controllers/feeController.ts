import { Request, Response } from "express";
import FeeStructure from "../models/FeeStructure.js";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import { generateReceiptNo } from "../utils/generateReceiptNo.js";

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const structures = await FeeStructure.find().populate("courseId");
    res.status(200).json({ success: true, data: structures });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
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
    let query: any = {};
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    const payments = await Payment.find(query)
      .populate("studentId", "personalInfo.name studentId")
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
    
    const receiptNo = generateReceiptNo();
    
    const payment = new Payment({
      studentId,
      feeStructureId,
      amount,
      method,
      transactionId,
      receiptNo,
      status: "COMPLETED",
      paidAt: new Date()
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
    const totalCollected = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const stats = totalCollected[0] || { total: 0 };
    
    // Calculate total expected based on student count * average fee (rough estimate for now)
    const studentCount = await Student.countDocuments({ "academicInfo.status": "active" });
    const pendingCount = await Payment.countDocuments({ status: "PENDING" });
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
