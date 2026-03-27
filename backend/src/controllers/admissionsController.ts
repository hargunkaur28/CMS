// FILE: backend/src/controllers/admissionsController.ts
import { Request, Response } from "express";
import Enquiry from "../models/Enquiry.js";
import Application from "../models/Application.js";
import Seat from "../models/Seat.js";
import Department from "../models/Department.js";

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

    enquiry.status = status;
    if (note) {
      enquiry.notes.push({ content: note, createdAt: new Date() });
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
      
      // Trigger WhatsApp Alert (Mock)
      console.log(`WhatsApp Alert: Student ${application.studentDetails.firstName} Admitted to ${application.assignedCourse}`);
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
