// FILE: backend/src/models/Enquiry.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IEnquiry extends Document {
  name: string;
  phone: string;
  email: string;
  courseInterested: string;
  source: "walk-in" | "online" | "referral";
  status: "new" | "follow-up" | "applied" | "admitted" | "rejected";
  notes: {
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    courseInterested: { type: String, required: true },
    source: {
      type: String,
      enum: ["walk-in", "online", "referral"],
      default: "online",
    },
    status: {
      type: String,
      enum: ["new", "follow-up", "applied", "admitted", "rejected"],
      default: "new",
    },
    notes: [
      {
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
