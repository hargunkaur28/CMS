// FILE: backend/src/models/Application.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  enquiryId: mongoose.Types.ObjectId;
  personalDetails: {
    name: string;
    dob: Date;
    gender: "male" | "female" | "other";
    address: string;
  };
  academicHistory: {
    institution: string;
    year: number;
    percentage: number;
  }[];
  documents: {
    type: string;
    fileUrl: string;
    verified: boolean;
  }[];
  courseId: mongoose.Types.ObjectId;
  status: "Applied" | "DocsVerified" | "Approved" | "Rejected" | "Enrolled";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    enquiryId: { type: Schema.Types.ObjectId, ref: "Enquiry", required: true },
    personalDetails: {
      name: { type: String, required: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      address: { type: String, required: true },
    },
    academicHistory: [
      {
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    documents: [
      {
        type: { type: String, required: true },
        fileUrl: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["Applied", "DocsVerified", "Approved", "Rejected", "Enrolled"],
      default: "Applied",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>("Application", ApplicationSchema);
