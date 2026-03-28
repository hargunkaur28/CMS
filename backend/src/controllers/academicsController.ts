import { Request, Response } from "express";
import Course from "../models/Course.js";
import Subject from "../models/Subject.js";
import Batch from "../models/Batch.js";

// --- Courses ---

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find().populate("subjects");
    res.status(200).json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = new Course(req.body);
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
    let query = courseId ? { courseId } : {};
    const subjects = await Subject.find(query).populate("courseId");
    res.status(200).json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const subject = new Subject(req.body);
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
    let query = courseId ? { courseId } : {};
    const batches = await Batch.find(query).populate("courseId").populate("students");
    res.status(200).json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const batch = new Batch(req.body);
    await batch.save();
    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
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
