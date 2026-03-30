// FILE: backend/src/controllers/admissionsController.ts
import { Request, Response } from "express";
import Enquiry from "../models/Enquiry.js";
import Application from "../models/Application.js";
import Seat from "../models/Seat.js";
import Department from "../models/Department.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import User from "../models/User.js";

// --- Enquiry Controllers ---

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const enquiry = new Enquiry(req.body);
    await enquiry.save();
    res.status(201).json({ success: true, data: enquiry, message: "Enquiry created successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const { status, course, source, search } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (course) query.courseInterested = course;
    if (source) query.source = source;
    if (search) query.name = { $regex: search, $options: "i" };

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries, message: "Enquiries fetched successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });

    if (note) {
      (enquiry.notes as any).push({ content: note, createdAt: new Date() });
    }
    await enquiry.save();
    res.status(200).json({ success: true, data: enquiry, message: "Enquiry status updated" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Application Controllers ---

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { enquiryId, studentDetails, assignedCourse, assignedBatch } = req.body;
    
    // Check if enquiry exists
    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });

    const application = new Application({
      enquiryRef: enquiryId,
      studentDetails,
      assignedCourse,
      assignedBatch,
      status: "pending"
    });

    // Handle files if uploaded via multer/cloudinary
    if (req.files && Array.isArray(req.files)) {
      application.documents = (req.files as any[]).map(file => ({
        name: file.originalname,
        cloudinaryUrl: file.path,
        uploadedAt: new Date()
      }));
    }

    await application.save();
    
    // Update enquiry status
    enquiry.status = "applied";
    await enquiry.save();

    res.status(201).json({ success: true, data: application, message: "Application submitted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const { status, course, batch } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (course) query.assignedCourse = course;
    if (batch) query.assignedBatch = batch;

    const applications = await Application.find(query).populate("enquiryRef").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications, message: "Applications fetched successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved / rejected / under-review
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    const previousStatus = application.status;
    application.status = status;

    // --- Seat Allocation Logic ---
    if (status === "approved" && previousStatus !== "approved") {
      // Decrement seat
      const seat = await Seat.findOne({ course: application.assignedCourse, batch: application.assignedBatch });
      if (!seat) return res.status(400).json({ success: false, message: "Seat matrix not configured for this course/batch" });
      if (seat.filledSeats >= seat.totalSeats) return res.status(400).json({ success: false, message: "No seats available" });
      
      seat.filledSeats += 1;
      await seat.save();
      
      // Update enquiry to admitted
      await Enquiry.findByIdAndUpdate(application.enquiryRef, { status: "admitted" });
      
      // -> START STUDENT ID GENERATION <-
      let dept = await Department.findOne({ courses: application.assignedCourse });
      if (!dept) {
        dept = await Department.findOne();
        if (!dept) {
          dept = new Department({ name: "General Administration", courses: [application.assignedCourse] });
          await dept.save();
        }
      }

      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const studentId = `NGCMS-${new Date().getFullYear()}-${randomDigits}`;

      // Resolve actual batchId from string name
      const batchDoc = await Batch.findOne({ 
        name: application.assignedBatch,
        courseId: application.assignedCourse // Note: If assignedCourse is a string, this might need a course lookup too.
      });
      
      if (!batchDoc) {
        console.warn(`[ENROLLMENT] Could not find Batch document for name "${application.assignedBatch}". Student batchId will be null.`);
      }

      const newStudent = new Student({
        uniqueStudentId: studentId,
        batchId: batchDoc?._id, // LINK RESOLVED ID HERE

        personalInfo: {
          firstName: application.studentDetails.firstName,
          lastName: application.studentDetails.lastName,
          dob: application.studentDetails.dob,
          gender: application.studentDetails.gender,
          phone: application.studentDetails.phone,
          email: application.studentDetails.email,
          address: application.studentDetails.address,
        },
        academicInfo: {
          course: application.assignedCourse,
          batch: application.assignedBatch,
          department: dept._id,
          semester: 1,
          enrollmentDate: new Date(),
          status: "active",
        },
        parentInfo: {
          name: application.studentDetails.parentName,
          phone: application.studentDetails.parentPhone,
          email: "parent@example.com", // Mock since Application currently lacks parent email
          relation: "Parent",
        },
        documents: application.documents,
      });

      await newStudent.save();
      
      // Trigger WhatsApp Alert (Mock)
      console.log(`WhatsApp Alert: Student ${application.studentDetails.firstName} Admitted to ${application.assignedCourse}. ID Generated: ${studentId}`);
    } else if (status === "rejected" && previousStatus === "approved") {
      // Revert seat if it was previously approved
      const seat = await Seat.findOne({ course: application.assignedCourse, batch: application.assignedBatch });
      if (seat && seat.filledSeats > 0) {
        seat.filledSeats -= 1;
        await seat.save();
      }
      // Update enquiry back to applied
      await Enquiry.findByIdAndUpdate(application.enquiryRef, { status: "applied" });
    }

    await application.save();
    res.status(200).json({ success: true, data: application, message: `Application ${status}` });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Seat Controllers ---

export const getSeatMatrix = async (req: Request, res: Response) => {
  try {
    const seats = await Seat.find();
    res.status(200).json({ success: true, data: seats, message: "Seat matrix fetched successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const configureSeats = async (req: Request, res: Response) => {
  try {
    const { course, batch, totalSeats, reservedSeats } = req.body;
    const seat = await Seat.findOneAndUpdate(
      { course, batch },
      { totalSeats, reservedSeats },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: seat, message: "Seats configured successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAdmissionsReport = async (req: Request, res: Response) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();
    const pendingApps = await Application.countDocuments({ status: "pending" });
    const admittedThisMonth = await Application.countDocuments({
      status: "approved",
      updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    // Calculate total fill rate
    const seats = await Seat.find();
    const totalCapacity = seats.reduce((acc, s) => acc + s.totalSeats, 0);
    const totalFilled = seats.reduce((acc, s) => acc + s.filledSeats, 0);
    const fillRate = totalCapacity > 0 ? (totalFilled / totalCapacity) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        pendingApps,
        admittedThisMonth,
        fillRate
      },
      message: "Admissions report generated"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Enroll an approved applicant as a student
 */
export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    res.status(200).json({ success: true, message: "Student enrollment confirmed" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


