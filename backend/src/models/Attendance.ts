// FILE: backend/src/models/Attendance.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectId: string; // Could be ref to Subject if model exists
  courseId: string;
  batchId: string;
  date: Date;
  status: "present" | "absent" | "late" | "excused";
  markedAt: Date;
  remarks?: string;
}

const AttendanceSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: String, required: true },
    courseId: { type: String, required: true },
    batchId: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    markedAt: { type: Date, default: Date.now },
    remarks: { type: String },
  },
  { timestamps: true }
);

// Index for quick performance on reports
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ batchId: 1, subjectId: 1, date: 1 });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
