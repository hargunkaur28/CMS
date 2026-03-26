import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  collegeId: mongoose.Types.ObjectId;
  designation: string;
  department: string;
  specialization: string;
  experienceYears: number;
}

const FacultySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  specialization: { type: String },
  experienceYears: { type: Number, default: 0 },
}, { timestamps: true });

FacultySchema.index({ employeeId: 1, collegeId: 1 }, { unique: true });

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
