// FILE: backend/src/models/Attendance.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  records: {
    studentId: mongoose.Types.ObjectId;
    status: 'Present' | 'Absent' | 'Leave';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true }, // Using Batch ref as classId for consistency
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  records: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true }
  }]
}, { timestamps: true });

// Index for quick performance on reports
AttendanceSchema.index({ studentId: 1, date: 1 });
AttendanceSchema.index({ batchId: 1, subjectId: 1, date: 1 });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
