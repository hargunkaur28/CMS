// FILE: backend/src/controllers/studentsController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";
import User from "../models/User.js";
import Department from "../models/Department.js";
import { generateStudentId } from "../utils/studentIdGenerator.js";
import { parseStudentCSV } from "../utils/csvImporter.js";

export const getStudents = async (req: Request, res: Response) => {
  try {
    const { course, batch, department, status, search } = req.query;
    const collegeId = (req as any).user.collegeId;
    const query: any = { collegeId }; // Only show students for this college
    if (course) query["academicInfo.course"] = course;
    if (batch) query["academicInfo.batch"] = batch;
    if (department) query["academicInfo.department"] = department;
    if (status) query["academicInfo.status"] = status;
    if (search) {
      query.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { uniqueStudentId: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query).populate("academicInfo.department").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: students, message: "Students fetched successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collegeId = (req as any).user.collegeId;
    const student = await Student.findOne({ uniqueStudentId: id, collegeId }).populate("academicInfo.department");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: student, message: "Student profile found" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get the student profile for the current logged in user (student or parent)
 */
export const getMyStudent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ success: false, message: "Not authorized" });

    let student;

    if (user.role === 'STUDENT') {
      // Build query with multi-tenant isolation
      const query: any = { userId: user._id };
      if (user.collegeId) query.collegeId = user.collegeId;

      student = await Student.findOne(query)
        .populate("academicInfo.department", "name")
        .select("-documents"); // Exclude heavy documents array from dashboard payload

    } else if (user.role === 'PARENT') {
      // For parents, look up via parentInfo email (existing approach)
      student = await Student.findOne({ "parentInfo.email": user.email })
        .populate("academicInfo.department", "name")
        .select("-documents");
    }

    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found. Please contact the administration." });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    console.error("[GET_MY_STUDENT] Unexpected error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const studentData = req.body;
    studentData.uniqueStudentId = await generateStudentId();
    studentData.collegeId = (req as any).user.collegeId;

    // Create a corresponding User account for the student
    const newUser = new User({
      name: `${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`,
      email: studentData.personalInfo.email,
      password: "Student@123", // Default password
      role: "STUDENT",
      collegeId: studentData.collegeId
    });
    await newUser.save();
    
    studentData.userId = newUser._id;
    const student = new Student(studentData);
    await student.save();
    
    res.status(201).json({ success: true, data: student, message: "Student enrolled successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collegeId = (req as any).user.collegeId;
    const student = await Student.findOneAndUpdate({ uniqueStudentId: id, collegeId }, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: student, message: "Student profile updated" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const bulkImportStudents = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No CSV file uploaded" });

    const rawData = await parseStudentCSV(req.file.path);
    const importedStudents = [];
    const errors = [];

    const adminUser = (req as any).user;
    const collegeId = adminUser.collegeId;
    
    // Fetch departments for lookup
    const departments = await Department.find({ collegeId });

    for (const row of rawData) {
      try {
        const uniqueId = await generateStudentId();
        
        // Helper to find value regardless of case/spaces in header
        const getVal = (keys: string[]) => {
          const foundKey = Object.keys(row).find(k => 
            keys.some(key => k.toLowerCase().replace(/\s/g, '') === key.toLowerCase().replace(/\s/g, ''))
          );
          return foundKey ? row[foundKey] : undefined;
        };

        // Resolve department
        const deptVal = getVal(["departmentId", "department", "dept"]);
        let deptId = mongoose.isValidObjectId(deptVal) ? deptVal : null;
        
        if (!deptId && deptVal) {
          const matchedDept = departments.find(d => 
            d.name.toLowerCase().includes(String(deptVal).toLowerCase())
          );
          
          if (matchedDept) {
            deptId = matchedDept._id;
          } else {
            // Auto-create department if not found (Demo fallback)
            const newDept = new Department({ name: deptVal, collegeId });
            await newDept.save();
            departments.push(newDept);
            deptId = newDept._id;
          }
        }

        // Final fallback: Use "General" or some existing dept
        if (!deptId) {
          const defaultDept = departments[0] || await Department.findOneAndUpdate(
            { name: "General", collegeId }, 
            { name: "General", collegeId }, 
            { upsert: true, new: true }
          );
          
          if (defaultDept) {
            deptId = defaultDept._id;
            if (departments.length === 0) departments.push(defaultDept);
          }
        }

        if (!deptId) {
          throw new Error("Critical Failure: Could not resolve or create any department ID.");
        }

        // Force a valid Date or fallback
        const dobStr = getVal(["dob", "date of birth", "birthday"]);
        const dob = (dobStr && !isNaN(Date.parse(dobStr))) ? new Date(dobStr) : new Date();

        // Create a corresponding User account first
        const studentEmail = getVal(["email", "email address"]);
        const firstName = getVal(["firstName", "first name", "name"]);
        const lastName = getVal(["lastName", "last name", "surname"]) || "N/A";

        if (!studentEmail || !firstName) {
          throw new Error("Missing required identity fields (Email or Name)");
        }

        const newUser = new User({
          name: `${firstName} ${lastName}`,
          email: studentEmail,
          password: "Student@123", // Default password
          role: "STUDENT",
          collegeId
        });
        await newUser.save();

        // Map CSV row to Student Schema with fallbacks
        const student = new Student({
          uniqueStudentId: uniqueId,
          userId: newUser._id,
          collegeId, // IMPORTANT: Link imported student to the current admin's college
          personalInfo: {
            firstName,
            lastName,
            email: studentEmail,
            phone: getVal(["phone", "mobile", "contact"]) || "0000000000",
            gender: (getVal(["gender"]) || "other").toLowerCase(),
            dob,
            address: getVal(["address", "home address"]) || "N/A"
          },
          academicInfo: {
            course: getVal(["course", "program"]) || "General",
            batch: getVal(["batch", "year"]) || new Date().getFullYear().toString(),
            department: deptId,
            status: "active",
            semester: 1
          },
          parentInfo: {
            name: getVal(["parentName", "guardian", "father name"]) || "N/A",
            phone: getVal(["parentPhone", "parent contact"]) || "0000000000",
            email: getVal(["parentEmail", "parent email"]) || "parent@example.com",
            relation: getVal(["relation", "relationship"]) || "Guardian"
          },
          documents: []
        });
        await student.save();
        importedStudents.push(student);
      } catch (err: any) {
        console.error(`IMPORT ROW ERROR (Row ${importedStudents.length + errors.length + 1}):`, err.message);
        console.error("DATA:", JSON.stringify(row));
        errors.push({ row, error: err.message });
      }
    }

    res.status(201).json({ 
      success: true, 
      data: { imported: importedStudents.length, errors }, 
      message: `Import complete. ${importedStudents.length} success, ${errors.length} failed.` 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadStudentPhoto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.file && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY)) {
      // If no file and no cloudinary, or just no cloudinary, we can return a dummy
      const student = await Student.findOneAndUpdate(
        { uniqueStudentId: id },
        { "personalInfo.photo": `http://${req.get('host') || 'localhost:5000'}/uploads/temp/demo-avatar.png` },
        { new: true }
      );
      if (!student) return res.status(404).json({ success: false, message: "Student not found" });
      return res.status(200).json({ success: true, data: student, message: "Demo mode: Dummy photo set" });
    }

    if (!req.file) return res.status(400).json({ success: false, message: "No photo uploaded" });

    const student = await Student.findOneAndUpdate(
      { uniqueStudentId: id },
      { "personalInfo.photo": req.file.path },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.status(200).json({ success: true, data: student, message: "Photo uploaded successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ "academicInfo.status": "active" });
    const droppedStudents = await Student.countDocuments({ "academicInfo.status": "dropped" });
    
    const newThisMonth = await Student.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const dropoutRate = totalStudents > 0 ? (droppedStudents / totalStudents) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        newThisMonth,
        dropoutRate
      },
      message: "Student stats fetched successfully"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const uploadDocs = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const files = req.files as any[];

    // Fallback if Cloudinary is not configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn("CLOUDINARY NOT CONFIGURED: Using dummy URLs for testing.");
      const docs = files.map(f => ({
        name: f.originalname,
        cloudinaryUrl: `http://${req.get('host') || 'localhost:5000'}/uploads/temp/${f.filename}`,
        uploadedAt: new Date()
      }));
      return res.status(200).json({ success: true, data: docs, message: "Demo mode: Files accepted (not stored)" });
    }

    const docs = files.map(f => ({
      name: f.originalname,
      cloudinaryUrl: f.path,
      uploadedAt: new Date()
    }));

    res.status(200).json({ success: true, data: docs, message: "Documents uploaded successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const softDeleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const collegeId = (req as any).user.collegeId;
    await Student.findOneAndUpdate({ uniqueStudentId: id, collegeId }, { "academicInfo.status": "dropped" });
    res.status(200).json({ success: true, message: "Student record archived" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStudentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const collegeId = (req as any).user.collegeId;
    await Student.findOneAndUpdate({ uniqueStudentId: id, collegeId }, { "academicInfo.status": status });
    res.status(200).json({ success: true, message: "Student status updated" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

