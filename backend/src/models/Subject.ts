import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  courseId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  credits: number;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  credits: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
