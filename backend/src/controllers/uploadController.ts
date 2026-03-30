import { Request, Response } from 'express';
import Material from '../models/Material.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';

/**
 * @desc    Upload material (Handled by Multer middleware before reaching here)
 * @route   POST /api/teacher/upload
 * @access  Private (Teacher)
 */
export const uploadMaterial = async (req: Request, res: Response) => {
  try {
    const { title, description, type, classId, subjectId, dueDate } = req.body;
    const teacherId = (req as any).user?._id;
    const fileUrl = req.file?.path; // Provided by Cloudinary storage

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'File upload failed' });
    }

    const material = await Material.create({
      teacherId,
      classId,
      subjectId,
      title,
      description,
      type,
      fileUrl,
      dueDate
    });

    res.status(201).json({ success: true, data: material });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    List teacher's uploaded materials
 * @route   GET /api/teacher/materials
 * @access  Private (Teacher)
 */
export const getMaterials = async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).user?._id;
    const materials = await Material.find({ teacherId })
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: materials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete own material
 * @route   DELETE /api/teacher/materials/:id
 * @access  Private (Teacher)
 */
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacherId = (req as any).user?._id;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
    }

    // Note: Ideally also delete from Cloudinary here
    await material.deleteOne();

    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get materials for the current student
 * @route   GET /api/students/materials
 */
export const getStudentMaterials = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const collegeId = (req as any).user?.collegeId;

    const student = await Student.findOne({ userId, collegeId });
    if (!student) return res.status(404).json({ success: false, message: "Student profile not found" });

    let batchId = student.batchId;

    // FALLBACK: Lookup by name
    if (!batchId && student.academicInfo?.batch) {
       const resolvedBatch = await Batch.findOne({ name: student.academicInfo.batch, collegeId });
       if (resolvedBatch) batchId = resolvedBatch._id;
    }

    if (!batchId) {
      return res.status(400).json({ success: false, message: "Student is not assigned to a valid batch" });
    }

    const materials = await Material.find({ classId: batchId })
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: materials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

