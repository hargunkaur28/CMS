import { Request, Response } from 'express';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments
 * @access  Private (Teacher)
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, subjectId, batchId, dueDate, maxMarks, attachments } = req.body;
    const user = (req as any).user;

    const assignment = new Assignment({
      title,
      description,
      subjectId,
      batchId,
      teacherId: user._id,
      collegeId: user.collegeId,
      dueDate,
      maxMarks,
      attachments
    });

    await assignment.save();

    // Trigger real-time notification for students in the batch
    try {
      const { createAndEmitBulkNotifications } = await import('../services/notificationService.js');
      const students = await Student.find({ batchId, collegeId: user.collegeId }).select('userId');
      const recipients = students.map(s => ({ userId: s.userId, role: 'STUDENT' }));

      if (recipients.length > 0) {
        await createAndEmitBulkNotifications(
          recipients,
          {
            title: `New Assignment: ${title}`,
            message: `Subject: ${subjectId}. Due: ${new Date(dueDate).toLocaleDateString()}`,
            type: 'announcement',
            senderUserId: user._id,
            collegeId: user.collegeId,
            metadata: { assignmentId: assignment._id, type: 'assignment' }
          },
          (prefix) => `${prefix}/student/assignments`
        );
      }
    } catch (notifErr) {
      console.error("[NOTIF] Failed to send assignment notification:", notifErr);
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get assignments for the current user
 * @route   GET /api/assignments
 * @access  Private (Student/Teacher)
 */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { role, _id, collegeId } = user;

    let query: any = { collegeId };

    if (role === 'STUDENT') {
      const student = await Student.findOne({ userId: _id });
      if (!student || !student.batchId) {
        return res.status(200).json({ success: true, data: [] });
      }
      query.batchId = student.batchId;
    } else if (role === 'TEACHER') {
      query.teacherId = _id;
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // If student, attach submission status
    if (role === 'STUDENT') {
      const submissions = await AssignmentSubmission.find({ 
        studentId: _id,
        assignmentId: { $in: assignments.map(a => a._id) }
      }).lean();

      const assignmentsWithStatus = assignments.map(a => {
        const sub = submissions.find(s => s.assignmentId.toString() === a._id.toString());
        return {
          ...a,
          submissionStatus: sub ? sub.status : 'PENDING',
          submissionId: sub ? sub._id : null,
          marksObtained: sub ? sub.marks : null
        };
      });
      return res.status(200).json({ success: true, data: assignmentsWithStatus });
    }

    res.status(200).json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get assignment detail by ID with strict batch filtering
 * @route   GET /api/assignments/:id
 * @access  Private (Student/Teacher)
 */
export const getAssignmentDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, _id } = (req as any).user;

    const assignment = await Assignment.findById(id)
      .populate('subjectId', 'name code')
      .populate('batchId', 'name')
      .populate('teacherId', 'name email')
      .lean();

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Strict batch-based filtering for students to maintain data isolation
    if (role === 'STUDENT') {
      const student = await Student.findOne({ userId: _id });
      if (!student || student.batchId?.toString() !== assignment.batchId?._id?.toString()) {
        console.warn(`[SECURITY] Student ${_id} attempted to access out-of-batch assignment ${id}`);
        return res.status(403).json({ success: false, message: 'Not authorized to view this assignment' });
      }

      // Populate submission status for student context
      const submission = await AssignmentSubmission.findOne({ 
        assignmentId: id, 
        studentId: _id 
      }).lean();

      return res.status(200).json({ 
        success: true, 
        data: {
          ...assignment,
          submissionStatus: submission ? submission.status : 'PENDING',
          submission: submission || null
        }
      });
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
