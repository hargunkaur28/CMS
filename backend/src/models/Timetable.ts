import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetable extends Document {
  batchId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
}

const TimetableSchema: Schema = new Schema({
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String },
}, { timestamps: true });

export default mongoose.model<ITimetable>('Timetable', TimetableSchema);
