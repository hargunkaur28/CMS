import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  batch: string;
  section: string;
  room: string;
  dayOfWeek: string;
  period: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class" },
    batch: { type: String, required: true },
    section: { type: String, required: true },
    room: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    period: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);
