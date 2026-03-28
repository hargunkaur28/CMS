import { Request, Response } from "express";
import Student from "../models/Student.js";
import User from "../models/User.js";

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { course, batch, status, search } = req.query;
    let query: any = {};

    if (course) query["academic.courseId"] = course;
    if (batch) query["academic.batchId"] = batch;
    if (status) query["status"] = status;
    if (search) {
      query["$or"] = [
        { "personalInfo.name": { $regex: search, $options: "i" } },
        { "studentId": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } }
      ];
    }

    const students = await Student.find(query)
      .populate("userId", "email role")
      .populate("academic.courseId")
      .populate("academic.batchId")
      .sort({ studentId: 1 });

    res.status(200).json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("userId")
      .populate("academic.courseId")
      .populate("academic.batchId");
    
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const softDeleteStudent = async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { status: "Dropped" }, { new: true });
    res.status(200).json({ success: true, data: student, message: "Student marked as Dropped" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkImportStudents = async (req: Request, res: Response) => {
  try {
    // Basic implementation for now - expecting an array of student objects
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: "Invalid students array" });
    }

    const results = await Student.insertMany(students);
    res.status(201).json({ success: true, data: results, count: results.length });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStudentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const student = await Student.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
