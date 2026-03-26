import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  rollNumber: string;
  courseId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  parentUserId?: mongoose.Types.ObjectId; // Link to Parent User
  dob: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address: string;
  status: 'active' | 'graduated' | 'dropped';
}

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rollNumber: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  parentUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  bloodGroup: { type: String },
  address: { type: String, required: true },
  status: { type: String, enum: ['active', 'graduated', 'dropped'], default: 'active' },
}, { timestamps: true });

StudentSchema.index({ rollNumber: 1, collegeId: 1 }, { unique: true });

export default mongoose.model<IStudent>('Student', StudentSchema);
