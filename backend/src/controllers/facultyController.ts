import { Request, Response } from "express";
import Faculty from "../models/Faculty.js";
import User from "../models/User.js";

export const getFaculties = async (req: Request, res: Response) => {
  try {
    const { department, status, search } = req.query;
    let query: any = {};

    if (department) query["department"] = department;
    if (status) query["status"] = status;
    if (search) {
      query["$or"] = [
        { "personalInfo.name": { $regex: search, $options: "i" } },
        { "employeeId": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } }
      ];
    }

    const faculties = await Faculty.find(query)
      .populate("userId", "email role")
      .populate("assignedSubjects")
      .sort({ employeeId: 1 });

    res.status(200).json({ success: true, data: faculties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacultyById = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate("userId")
      .populate("assignedSubjects");
    
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });
    res.status(200).json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFaculty = async (req: Request, res: Response) => {
  try {
    const { personalInfo, qualification, experience, department, collegeId } = req.body;
    const adminUser = (req as any).user;

    // Use provided collegeId or fallback to admin's collegeId
    const finalCollegeId = collegeId || adminUser?.collegeId;

    if (!finalCollegeId) {
      return res.status(400).json({ success: false, message: 'collegeId is required.' });
    }

    // 1. Create User
    const existingUser = await User.findOne({ email: personalInfo.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const employeeId = "EMP-" + Date.now().toString().slice(-6); 
    const user = new User({
      name: personalInfo.name,
      email: personalInfo.email,
      password: "Welcome@Faculty", // Should be changed on first login
      role: "TEACHER",
      collegeId: finalCollegeId
    });
    await user.save();

    // 2. Create Faculty Profile
    const faculty = new Faculty({
      userId: user._id,
      collegeId: finalCollegeId,
      employeeId,
      personalInfo,
      qualification,
      experience,
      department,
      status: "Active"
    });
    await faculty.save();

    res.status(201).json({ success: true, data: faculty });
  } catch (error: any) {
    console.error('[CREATE_FACULTY]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFaculty = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const softDeleteFaculty = async (req: Request, res: Response) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { status: "Resigned" }, { new: true });
    res.status(200).json({ success: true, data: faculty, message: "Faculty marked as Resigned" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const assignSubjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(id, { assignedSubjects: subjectIds }, { new: true });
    res.status(200).json({ success: true, data: faculty });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
