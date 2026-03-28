// FILE: backend/src/models/Student.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string; // NGM-2026-0001
  personalInfo: {
    name: string;
    dob: Date;
    gender: "male" | "female" | "other";
    bloodGroup?: string;
    phone: string;
    email: string;
    address: string;
    photo?: string;
  };
  parentInfo: {
    fatherName: string;
    motherName: string;
    guardianPhone: string;
    parentUserId?: mongoose.Types.ObjectId;
  };
  academic: {
    courseId: mongoose.Types.ObjectId;
    batchId: mongoose.Types.ObjectId;
    section?: string;
    semester: number;
    rollNumber?: string;
  };
  documents: {
    type: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  status: "Active" | "Detained" | "Alumni" | "Dropped";
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: String, required: true, unique: true },
    personalInfo: {
      name: { type: String, required: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      bloodGroup: { type: String },
      phone: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      address: { type: String, required: true },
      photo: { type: String },
    },
    parentInfo: {
      fatherName: { type: String, required: true },
      motherName: { type: String, required: true },
      guardianPhone: { type: String, required: true },
      parentUserId: { type: Schema.Types.ObjectId, ref: "User" },
    },
    academic: {
      courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
      batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
      section: { type: String },
      semester: { type: Number, default: 1 },
      rollNumber: { type: String },
    },
    documents: [
      {
        type: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Detained", "Alumni", "Dropped"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);
