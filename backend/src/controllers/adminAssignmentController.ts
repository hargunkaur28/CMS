// FILE: backend/src/controllers/adminAssignmentController.ts
import { Request, Response } from 'express';
import Faculty from '../models/Faculty.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Assign a teacher to a subject within a batch
 * @route   POST /api/admin/assign-teacher
 * @access  COLLEGE_ADMIN, SUPER_ADMIN
 */
export const assignTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId, subjectId, batchId } = req.body;
    const adminUser = (req as any).user;

    if (!teacherId || !subjectId || !batchId) {
      return res.status(400).json({ success: false, message: 'teacherId, subjectId, and batchId are required' });
    }

    // Validate referenced documents exist
    const [teacherUser, subject, batch] = await Promise.all([
      User.findById(teacherId),
      Subject.findById(subjectId),
      Batch.findById(batchId)
    ]);

    if (!teacherUser || teacherUser.role !== 'TEACHER') {
      return res.status(404).json({ success: false, message: 'Teacher user not found or invalid role' });
    }
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Find or create Faculty profile for this teacher
    let faculty = await Faculty.findOne({ userId: teacherId });
    if (!faculty) {
      const empId = `EMP${Date.now().toString().slice(-6)}`;
      faculty = await Faculty.create({
        userId: teacherId,
        collegeId: adminUser.collegeId || teacherUser.collegeId,
        employeeId: empId,
        personalInfo: { name: teacherUser.name, email: teacherUser.email },
        assignedSubjects: []
      });
    }

    // Check if this assignment already exists
    const alreadyAssigned = faculty.assignedSubjects.some(
      (a: any) => a.subjectId.toString() === subjectId && a.batchId.toString() === batchId
    );

    if (alreadyAssigned) {
      return res.status(200).json({ success: true, message: 'Teacher already assigned to this subject/batch', data: faculty });
    }

    // Push the new assignment
    faculty.assignedSubjects.push({ subjectId: new mongoose.Types.ObjectId(subjectId), batchId: new mongoose.Types.ObjectId(batchId) } as any);
    await faculty.save();

    console.log(`[ASSIGN] Teacher ${teacherUser.name} → Subject ${subject.name} in Batch ${batch.name}`);

    res.status(200).json({
      success: true,
      message: `${teacherUser.name} assigned to ${subject.name} in ${batch.name}`,
      data: faculty
    });
  } catch (error: any) {
    console.error('[ASSIGN_TEACHER]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Assign a student to a batch
 * @route   POST /api/admin/assign-student-batch
 * @access  COLLEGE_ADMIN, SUPER_ADMIN
 */
export const assignStudentToBatch = async (req: Request, res: Response) => {
  try {
    const { studentId, batchId } = req.body;

    if (!studentId || !batchId) {
      return res.status(400).json({ success: false, message: 'studentId and batchId are required' });
    }

    const [student, batch] = await Promise.all([
      Student.findById(studentId),
      Batch.findById(batchId)
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Update student's top-level batchId
    await Student.findByIdAndUpdate(studentId, { batchId });

    // Push to batch.students if not already there
    if (!batch.students.map((s: any) => s.toString()).includes(studentId.toString())) {
      batch.students.push(studentId);
      await batch.save();
    }

    console.log(`[ASSIGN] Student ${student.uniqueStudentId} → Batch ${batch.name}`);

    res.status(200).json({
      success: true,
      message: `Student assigned to ${batch.name}`,
      data: { studentId, batchId }
    });
  } catch (error: any) {
    console.error('[ASSIGN_STUDENT_BATCH]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Remove a teacher assignment
 * @route   DELETE /api/admin/assign-teacher
 */
export const removeTeacherAssignment = async (req: Request, res: Response) => {
  try {
    const { teacherId, subjectId, batchId } = req.body;

    const faculty = await Faculty.findOne({ userId: teacherId });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty profile not found' });

    faculty.assignedSubjects = faculty.assignedSubjects.filter(
      (a: any) => !(a.subjectId.toString() === subjectId && a.batchId.toString() === batchId)
    ) as any;
    await faculty.save();

    res.status(200).json({ success: true, message: 'Assignment removed', data: faculty });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all teacher assignments (for admin view)
 * @route   GET /api/admin/assignments
 */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).user;
    const query: any = {};
    if (adminUser.collegeId) query.collegeId = adminUser.collegeId;

    const faculties = await Faculty.find(query)
      .populate('userId', 'name email')
      .populate('assignedSubjects.subjectId', 'name code')
      .populate('assignedSubjects.batchId', 'name year');

    // Flatten to a readable list
    const assignments: any[] = [];
    faculties.forEach(f => {
      const teacher = f.userId as any;
      f.assignedSubjects.forEach((a: any) => {
        assignments.push({
          facultyId: f._id,
          teacherId: teacher?._id,
          teacherName: teacher?.name,
          teacherEmail: teacher?.email,
          subjectId: a.subjectId?._id,
          subjectName: a.subjectId?.name,
          subjectCode: a.subjectId?.code,
          batchId: a.batchId?._id,
          batchName: a.batchId?.name
        });
      });
    });

    res.status(200).json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
