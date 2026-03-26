import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

const AttendanceSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  remarks: { type: String },
}, { timestamps: true });

// Index for performance
AttendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
