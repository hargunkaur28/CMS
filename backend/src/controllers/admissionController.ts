import { Request, Response } from "express";
import Enquiry from "../models/Enquiry.js";
import Application from "../models/Application.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { generateStudentId } from "../utils/generateStudentId.js";

// --- Enquiries ---

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json({ success: true, data: enquiry });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await Enquiry.find().populate("courseInterest").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json({ success: true, data: enquiry });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Applications ---

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find().populate("enquiryId courseId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const application = await Application.findByIdAndUpdate(
      id, 
      { status, rejectionReason }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: application });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Enrollment Flow ---

export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { applicationId, batchId, section, rollNumber } = req.body;
    const application = await Application.findById(applicationId);
    
    if (!application || application.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Application must be approved before enrollment" });
    }

    // 1. Generate Student ID
    const studentId = await generateStudentId();

    // 2. Create User Profile for Login (Using email from enquiry if available, or placeholder)
    // We need to fetch the enquiry to get the email
    const enquiry: any = await Enquiry.findById(application.enquiryId);
    
    const tempPassword = "Welcome@" + studentId.split("-").pop();
    const user = new User({
      name: application.personalDetails.name,
      email: enquiry?.email || `${studentId.toLowerCase()}@university.edu`,
      password: tempPassword,
      role: "STUDENT",
    });
    await user.save();

    // 3. Create Student Profile
    const student = new Student({
      userId: user._id,
      studentId,
      personalInfo: {
        ...application.personalDetails,
        email: user.email,
        photo: application.documents.find(d => d.type === "Photo")?.fileUrl || "",
      },
      parentInfo: {
        fatherName: "Pending", // To be updated during full onboarding
        motherName: "Pending",
        guardianPhone: enquiry?.phone || "0000000000",
      },
      academic: {
        courseId: application.courseId,
        batchId,
        section,
        rollNumber,
        semester: 1,
      },
      status: "Active",
    });
    await student.save();

    // 4. Update Application status
    application.status = "Enrolled";
    await application.save();

    res.status(201).json({ 
      success: true, 
      data: { student, credentials: { email: user.email, password: tempPassword } },
      message: "Student enrolled successfully and login credentials generated"
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdmissionReports = async (req: Request, res: Response) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalEnrolled = await Student.countDocuments();
    
    // Simple stats
    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        totalApplications,
        totalEnrolled,
        conversionRate: totalEnquiries > 0 ? ((totalEnrolled / totalEnquiries) * 100).toFixed(1) + "%" : "0%"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
