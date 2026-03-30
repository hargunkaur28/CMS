import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  collegeId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  section: string;
  room: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  startTime: string;
  endTime: string;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema = new Schema(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    section: { type: String, required: true },
    room: { type: String, required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    period: { type: Number, required: true, min: 1, max: 10 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    academicYear: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

TimetableSchema.index(
  { collegeId: 1, teacherId: 1, dayOfWeek: 1, period: 1, academicYear: 1 },
  { unique: true }
);

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);
