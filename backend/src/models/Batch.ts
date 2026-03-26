import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string; // e.g., 2022-2026 Batch
  courseId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  startYear: number;
  endYear: number;
  currentSemester: number;
}

const BatchSchema: Schema = new Schema({
  name: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  currentSemester: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model<IBatch>('Batch', BatchSchema);
