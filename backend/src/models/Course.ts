import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  duration: number; // in semesters or years
  collegeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
}, { timestamps: true });

CourseSchema.index({ code: 1, collegeId: 1 }, { unique: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
