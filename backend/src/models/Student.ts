// FILE: backend/src/models/Student.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  uniqueStudentId: string; // NGCMS-2026-XXXX
  personalInfo: {
    firstName: string;
    lastName: string;
    dob: Date;
    gender: "male" | "female" | "other";
    phone: string;
    email: string;
    address: string;
    photo?: string; // Cloudinary URL
  };
  academicInfo: {
    course: string;
    batch: string;
    department: mongoose.Types.ObjectId;
    semester: number;
    section?: string;
    rollNumber?: string;
    userId?: mongoose.Types.ObjectId;
    collegeId?: mongoose.Types.ObjectId;
    enrollmentDate: Date;
    status: "active" | "inactive" | "graduated" | "dropped";
  };
  documents: {
    name: string;
    cloudinaryUrl: string;
    uploadedAt: Date;
  }[];
  parentInfo: {
    name: string;
    phone: string;
    email: string;
    relation: string;
  };
  guardianInfo?: {
    name: string;
    phone: string;
    relation: string;
  };
  previousEducation: {
    institution: string;
    qualification: string;
    year: number;
    percentage: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    uniqueStudentId: { type: String, required: true, unique: true },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      address: { type: String, required: true },
      photo: { type: String },
    },
    academicInfo: {
      course: { type: String, required: true },
      batch: { type: String, required: true },
      department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
      semester: { type: Number, default: 1 },
      section: { type: String },
      rollNumber: { type: String },
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      collegeId: { type: Schema.Types.ObjectId, ref: "College" },
      enrollmentDate: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["active", "inactive", "graduated", "dropped"],
        default: "active",
      },
    },
    documents: [
      {
        name: { type: String, required: true },
        cloudinaryUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    parentInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      relation: { type: String, required: true },
    },
    guardianInfo: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    previousEducation: [
      {
        institution: { type: String },
        qualification: { type: String },
        year: { type: Number },
        percentage: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);
