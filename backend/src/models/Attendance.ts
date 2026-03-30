// FILE: backend/src/models/Attendance.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  date: Date;
  lecture: number;
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
  lecture: { type: Number, required: true, min: 1, max: 8, default: 1 },
  records: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true }
  }]
}, { timestamps: true });

// Index for quick performance on reports and ensuring uniqueness per class/subject/date/lecture
AttendanceSchema.index({ "records.studentId": 1, date: 1 });
AttendanceSchema.index({ classId: 1, subjectId: 1, date: 1, lecture: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
