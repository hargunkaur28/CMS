import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  marksObtained: number;
  remarks?: string;
  isPassed: boolean;
}

const ResultSchema: Schema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  marksObtained: { type: Number, required: true },
  remarks: { type: String },
  isPassed: { type: Boolean, required: true },
}, { timestamps: true });

ResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IResult>('Result', ResultSchema);
