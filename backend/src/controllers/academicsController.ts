import { Request, Response } from "express";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import Batch from "../models/Batch.js";
import Student from "../models/Student.js";
import Section from "../models/Section.js";

// --- Courses ---

export const getCourses = async (req: Request, res: Response) => {
  try {
    const collegeId = (req as any).user?.collegeId;
    const query: any = {};
    if (collegeId) query.collegeId = collegeId;

    const courses = await Course.find(query).populate("subjects");
    res.status(200).json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    let collegeId = (req as any).user?.collegeId;
    
    // Fallback: inherit collegeId from the department if user is Super Admin
    if (!collegeId && req.body.department) {
      const Department = require("../models/Department.js").default;
      const dept = await Department.findById(req.body.department);
      if (dept) collegeId = dept.collegeId;
    }

    if (!collegeId) throw new Error("Missing institutional context (collegeId)");

    const courseData = { ...req.body, collegeId };
    
    const course = new Course(courseData);
    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: course });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Subjects ---

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.query;
    const collegeId = (req as any).user?.collegeId;
    let query: any = {};
    
    if (collegeId) query.collegeId = collegeId;
    if (courseId) query.courseId = courseId;

    const subjects = await Subject.find(query).populate("courseId");
    res.status(200).json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    let collegeId = (req as any).user?.collegeId;
    
    // Fallback: inherit collegeId from the course if user is Super Admin
    if (!collegeId && req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (course) collegeId = course.collegeId;
    }

    if (!collegeId) throw new Error("Missing institutional context (collegeId)");

    const subjectData = { ...req.body, collegeId };

    const subject = new Subject(subjectData);
    await subject.save();
    
    // Add subject to Course's subject list
    await Course.findByIdAndUpdate(req.body.courseId, { $push: { subjects: subject._id } });
    
    res.status(201).json({ success: true, data: subject });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Batches ---

export const getBatches = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.query;
    const collegeId = (req as any).user?.collegeId;
    let query: any = {};

    if (collegeId) query.collegeId = collegeId;
    if (courseId) query.courseId = courseId;

    const batches = await Batch.find(query).populate("courseId").populate("students");
    res.status(200).json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    let collegeId = (req as any).user?.collegeId;
    
    // Fallback: inherit collegeId from the course if user is Super Admin
    if (!collegeId && req.body.courseId) {
      const course = await Course.findById(req.body.courseId);
      if (course) collegeId = course.collegeId;
    }

    if (!collegeId) throw new Error("Missing institutional context (collegeId)");

    console.log("[DEBUG] createBatch: Resolved collegeId =", collegeId);
    console.log("[DEBUG] createBatch: Body =", req.body);
    const batchData = { ...req.body, collegeId };

    const batch = new Batch(batchData);
    await batch.save();
    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
    console.error("[DEBUG] createBatch: Validation Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addBatchSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { section } = req.body;
    if (!section) return res.status(400).json({ success: false, message: 'Section name is required' });

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    if (batch.sections.includes(section)) {
      return res.status(400).json({ success: false, message: 'Section already exists in this batch' });
    }

    batch.sections.push(section);
    await batch.save();
    res.status(200).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeBatchSection = async (req: Request, res: Response) => {
  try {
    const { id, section } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    batch.sections = batch.sections.filter((s: string) => s !== section);
    await batch.save();
    res.status(200).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBatchStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findById(id).populate({
      path: 'students',
      populate: { path: 'userId', select: 'name email' }
    });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.status(200).json({ success: true, data: batch.students });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeStudentFromBatch = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;
    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    batch.students = batch.students.filter((s: any) => s.toString() !== studentId) as any;
    await batch.save();

    await Student.findByIdAndUpdate(studentId, { $unset: { batchId: 1 } });
    res.status(200).json({ success: true, message: 'Student removed from batch' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignStudentsToSection = async (req: Request, res: Response) => {
  try {
    const { id, section } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No students provided for assignment' });
    }

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    
    if (!batch.sections.includes(section as string)) {
      return res.status(400).json({ success: false, message: 'Section does not exist in this batch' });
    }

    // Explicit check requested by user: fail if any student is already in THAT section
    const alreadyInSection = await Student.find({ _id: { $in: studentIds }, "academicInfo.section": section });
    if (alreadyInSection.length > 0) {
      return res.status(400).json({ success: false, message: 'One or more selected students are already assigned to this section.' });
    }

    await Student.updateMany(
      { _id: { $in: studentIds } }, 
      {
        $set: {
          "academicInfo.section": section,
          "academicInfo.batch": batch.name,
          "batchId": batch._id,
          "collegeId": batch.collegeId,
        }
      }
    );

    res.status(200).json({ success: true, message: `Successfully assigned ${studentIds.length} students to Section ${section}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
