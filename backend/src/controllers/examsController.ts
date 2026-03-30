import { Request, Response } from "express";
import Exam from "../models/Exam.js";
import Marks from "../models/Marks.js";
import Result from "../models/Result.js";
import HallTicket from "../models/HallTicket.js";
import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import mongoose from "mongoose";
import { emitToStudent, emitToBatch } from "../config/socket.js";
import { calculateTotalMarks, calculateGrade, calculateCGPA } from "../services/gradeCalculator.js";

/**
 * Create a new exam
 * POST /api/exams
 */
export const createExam = async (req: Request, res: Response) => {
  try {
    const exam = new Exam({
      ...req.body,
      status: 'DRAFT',
      createdBy: (req as any).user?._id // Assuming authMiddleware attaches user
    });
    await exam.save();
    res.status(201).json({ success: true, data: exam, message: "Exam created as DRAFT" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get all exams with filters
 * GET /api/exams
 */
export const getExams = async (req: Request, res: Response) => {
  try {
    const { collegeId, status, courseId } = req.query;
    const query: any = {};
    
    const isValidObjectId = (id: any) => mongoose.Types.ObjectId.isValid(id);

    if (collegeId && isValidObjectId(collegeId)) query.collegeId = collegeId;
    if (status && status !== 'undefined') query.status = status;
    if (courseId && isValidObjectId(courseId)) query.courses = courseId;

    const exams = await Exam.find(query).sort({ scheduleDate: -1 });
    res.status(200).json({ success: true, data: exams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get exam by ID
 * GET /api/exams/:examId
 */
export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.examId)
      .populate("courses", "name code")
      .populate("subjects", "name code");
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.status(200).json({ success: true, data: exam });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update exam details
 * PUT /api/exams/:examId
 */
export const updateExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.examId, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.status(200).json({ success: true, data: exam, message: "Exam updated successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Schedule an exam (DRAFT -> SCHEDULED)
 * PATCH /api/exams/:examId/schedule
 */
export const scheduleExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.examId,
      { status: 'SCHEDULED' },
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });
    res.status(200).json({ success: true, data: exam, message: "Exam scheduled successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Enter marks for a student
 * POST /api/exams/:examId/marks
 */
export const enterMarks = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { studentId, subjectId, components, courseId, batchId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const totalMarks = calculateTotalMarks(components);
    const { grade, gradePoint } = calculateGrade(totalMarks, exam.totalMarks, exam.gradingScheme);

    const marks = await Marks.findOneAndUpdate(
      { examId, studentId, subjectId },
      {
        examId,
        studentId,
        subjectId,
        courseId,
        batchId,
        components,
        totalMarks,
        grade,
        gradePoint,
        status: 'COMPLETED',
        enteredBy: (req as any).user?._id,
        enteredAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: marks, message: "Marks entered successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Bulk import marks via CSV/Excel logic
 * POST /api/exams/:examId/marks/bulk-import
 */
export const bulkImportMarks = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { records } = req.body; // Array of { studentId, subjectId, courseId, batchId, components }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const operations = records.map((record: any) => {
      const totalMarks = calculateTotalMarks(record.components);
      const { grade, gradePoint } = calculateGrade(totalMarks, exam.totalMarks, exam.gradingScheme);

      return {
        updateOne: {
          filter: { examId, studentId: record.studentId, subjectId: record.subjectId },
          update: {
            ...record,
            examId,
            totalMarks,
            grade,
            gradePoint,
            status: 'COMPLETED',
            enteredBy: (req as any).user?._id,
            enteredAt: new Date()
          },
          upsert: true
        }
      };
    });

    await Marks.bulkWrite(operations);
    res.status(200).json({ success: true, message: `Marks imported for ${records.length} records` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get marks for an exam
 * GET /api/exams/:examId/marks
 */
export const getMarks = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { studentId, subjectId, batchId } = req.query;
    const query: any = { examId };
    if (studentId) query.studentId = studentId;
    if (subjectId) query.subjectId = subjectId;
    if (batchId) query.batchId = batchId;

    const marks = await Marks.find(query)
      .populate("studentId", "personalInfo.firstName personalInfo.lastName uniqueStudentId")
      .populate("subjectId", "name code");
    
    res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Publish results for an exam
 * POST /api/exams/:examId/publish
 */
export const publishResults = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId).session(session);
    if (!exam) throw new Error("Exam not found");

    // 1. Get all marks for this exam and populate subjects
    const allMarks = await Marks.find({ examId })
      .populate("subjectId", "name code")
      .populate("batchId", "name")
      .populate("courseId", "name")
      .session(session);

    // 2. Aggregate marks by student
    const studentMarksMap = new Map();
    allMarks.forEach((mark: any) => {
      if (!studentMarksMap.has(mark.studentId.toString())) {
        studentMarksMap.set(mark.studentId.toString(), []);
      }
      studentMarksMap.get(mark.studentId.toString()).push(mark);
    });

    // 3. Create results and hall tickets for each student
    const resultOps = [];
    const hallTicketOps = [];

    for (const [studentId, marks] of studentMarksMap.entries()) {
      const student = await Student.findById(studentId)
        .populate("academicInfo.department", "name")
        .session(session);
      if (!student) continue;

      const totalObtained = marks.reduce((sum: number, m: any) => sum + m.totalMarks, 0);
      const totalPossible = marks.length * exam.totalMarks;
      const percentage = (totalObtained / totalPossible) * 100;
      const cgpa = calculateCGPA(marks.map((m: any) => ({ gradePoint: m.gradePoint })));

      const subjects = marks.map((m: any) => ({
        subjectId: m.subjectId._id,
        subjectName: m.subjectId.name,
        marks: m.totalMarks,
        maxMarks: exam.totalMarks,
        grade: m.grade,
        gradePoint: m.gradePoint,
        status: m.totalMarks >= exam.passingMarks ? 'PASS' : 'FAIL'
      }));

      const isPass = subjects.every((s: any) => s.status === 'PASS');

      resultOps.push({
        updateOne: {
          filter: { examId, studentId },
          update: {
            examId,
            studentId,
            courseId: marks[0].courseId?._id || marks[0].courseId,
            batchId: marks[0].batchId?._id || marks[0].batchId,
            subjects,
            totalMarksObtained: totalObtained,
            totalMaxMarks: totalPossible,
            percentage,
            cgpa,
            status: isPass ? 'PASS' : 'FAIL',
            publishedDate: new Date(),
            publishedBy: (req as any).user?._id
          },
          upsert: true
        }
      });

      // Simple unique ticket number generation
      const ticketNumber = `HT-${exam.code}-${student.uniqueStudentId}`;

      hallTicketOps.push({
        updateOne: {
          filter: { examId, studentId },
          update: {
            examId,
            studentId,
            ticketNumber,
            studentInfo: {
              name: student.personalInfo.name || `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
              rollNumber: student.academicInfo.rollNumber || student.uniqueStudentId,
              enrollmentNumber: student.uniqueStudentId,
              photo: student.personalInfo.photo || "",
              course: marks[0].courseId?.name || "B.Tech",
              batch: marks[0].batchId?.name || student.academicInfo.batch || "Year 1",
              department: (student.academicInfo.department as any)?.name || "Engineering"
            },
            examInfo: {
              examCode: exam.code,
              examName: exam.name,
              scheduleDate: exam.scheduleDate,
              duration: exam.duration,
              venue: exam.venue || "Examination Wing",
              seatNumber: "Assigned per hall",
              invigilator: "Departmental Staff"
            },
            status: 'PUBLISHED',
            generatedAt: new Date()
          },
          upsert: true
        }
      });
    }

    if (resultOps.length > 0) await Result.bulkWrite(resultOps, { session });
    if (hallTicketOps.length > 0) await HallTicket.bulkWrite(hallTicketOps, { session });

    // Emit real-time notifications to each student and parent
    studentMarksMap.forEach((marks, studentId) => {
      emitToStudent(studentId, "resultsPublished", { examId });
    });
    const batchId = (allMarks[0] as any)?.batchId;
    if (batchId) {
      emitToBatch(batchId.toString(), "resultsPublished", { examId });
    }

    // 4. Update exam status
    exam.status = 'PUBLISHED';
    exam.publishedDate = new Date();
    exam.publishedBy = (req as any).user?._id;
    await exam.save({ session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Results published and Hall Tickets generated" });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

/**
 * Get results for a student or exam
 * GET /api/results
 */
export const getResults = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.query;
    console.log(`[RESULTS API] studentId: "${studentId}", examId: "${examId}"`);
    const query: any = {};
    const user = (req as any).user;
    const isValidObjectId = (id: any) => {
      if (!id || id === 'undefined' || id === 'null' || id === '') return false;
      return mongoose.Types.ObjectId.isValid(id);
    };

    if (user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: user._id });
      if (!student) return res.status(404).json({ success: false, message: "Student profile not found" });
      query.studentId = student._id;
    } else if (user.role === 'PARENT') {
      const parent = await Parent.findOne({ userId: user._id });
      if (!parent || !parent.students.length) {
        return res.status(404).json({ success: false, message: "No linked students found for this parent" });
      }
      query.studentId = parent.students[0]; // Default to first child for detailed view
    } else if (studentId && isValidObjectId(studentId)) {
      query.studentId = studentId;
    }
    
    if (examId && isValidObjectId(examId)) {
      query.examId = examId;
    }

    console.log(`[RESULTS API] Generated query:`, JSON.stringify(query));
    const results = await Result.find(query)
      .populate("studentId", "personalInfo.firstName personalInfo.lastName uniqueStudentId")
      .populate("examId", "name code totalMarks")
      .sort({ createdAt: -1 });
    
    // 4. Calculate Aggregates
    const totalExams = results.length;
    const overallCgpa = totalExams > 0 
      ? parseFloat((results.reduce((acc, r) => acc + r.cgpa, 0) / totalExams).toFixed(2))
      : 0;
    const latestPercentage = totalExams > 0 ? results[0].percentage : 0;

    res.status(200).json({ 
      success: true, 
      data: {
        overallCgpa,
        latestPercentage,
        totalExams,
        results
      } 
    });
  } catch (error: any) {
    console.error(`[RESULTS API] Error:`, error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get hall ticket for a student
 * GET /api/hall-tickets/:studentId/:examId
 */
export const getHallTicket = async (req: Request, res: Response) => {
  try {
    const { studentId, examId } = req.params;
    const ticket = await HallTicket.findOne({ studentId, examId });
    if (!ticket) return res.status(404).json({ success: false, message: "Hall ticket not found" });
    
    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate exam performance analysis
 * GET /api/reports/exam-analysis
 */
export const generateExamAnalysis = async (req: Request, res: Response) => {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ success: false, message: "examId is required" });

    const stats = await Result.aggregate([
      { $match: { examId: new mongoose.Types.ObjectId(examId as string) } },
      {
        $group: {
          _id: "$examId",
          avgPercentage: { $avg: "$percentage" },
          maxPercentage: { $max: "$percentage" },
          minPercentage: { $min: "$percentage" },
          passCount: { $sum: { $cond: [{ $eq: ["$status", "PASS"] }, 1, 0] } },
          failCount: { $sum: { $cond: [{ $eq: ["$status", "FAIL"] }, 1, 0] } },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
