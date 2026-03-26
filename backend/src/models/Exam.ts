import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  title: string;
  type: 'internal' | 'semester' | 'practical' | 'assignment';
  subjectId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  date: Date;
  totalMarks: number;
}

const ExamSchema: Schema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['internal', 'semester', 'practical', 'assignment'], required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IExam>('Exam', ExamSchema);
