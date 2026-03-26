import { Request, Response } from 'express';
import Admission from '../models/Admission.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { generateStudentId } from '../utils/idGenerator.js';

// @desc    Create new admission enquiry
// @route   POST /api/admissions/enquiry
// @access  Public
export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const admission = await Admission.create({
      ...req.body,
      status: 'enquiry'
    });
    res.status(201).json(admission);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all admissions (with filters)
// @route   GET /api/admissions
// @access  Private/Admin
export const getAdmissions = async (req: any, res: Response) => {
  try {
    const { status, collegeId } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (collegeId) query.collegeId = collegeId;

    const admissions = await Admission.find(query).populate('courseId', 'name');
    res.json(admissions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update admission status (Workflow)
// @route   PATCH /api/admissions/:id/status
// @access  Private/Admin
export const updateAdmissionStatus = async (req: Request, res: Response) => {
  try {
    const { status, remarks } = req.body;
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    admission.status = status;
    if (remarks) admission.remarks = remarks;
    
    await admission.save();
    res.json(admission);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Final Enrollment (Approved -> Enrolled)
// @route   POST /api/admissions/:id/enroll
// @access  Private/Admin
export const enrollStudent = async (req: Request, res: Response) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission || admission.status !== 'approved') {
      return res.status(400).json({ message: 'Admission must be approved before enrollment' });
    }

    const { batchId } = req.body;
    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required for enrollment' });
    }

    // 1. Generate Unique Student ID
    const studentIdStr = await generateStudentId(admission.collegeId.toString());

    // 2. Create User account for Student
    const user = await User.create({
      name: admission.fullName,
      email: admission.email,
      password: 'student123', // Default password
      role: 'STUDENT',
      collegeId: admission.collegeId,
      isActive: true
    });

    // 3. Create Student profile
    const student = await Student.create({
      userId: user._id,
      rollNumber: studentIdStr,
      courseId: admission.courseId,
      batchId: batchId,
      collegeId: admission.collegeId,
      dob: new Date(), // Should ideally come from admission form
      gender: 'other', // Should ideally come from admission form
      address: 'N/A', // Should ideally come from admission form
      status: 'active'
    });

    // 4. Update Admission record
    admission.status = 'enrolled';
    admission.enrolledDate = new Date();
    admission.studentId = student._id as any;
    await admission.save();

    res.status(201).json({ message: 'Student enrolled successfully', studentId: studentIdStr, student });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
