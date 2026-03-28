import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  duration: number; // years
  department: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  totalSeats: number;
  description?: string;
  subjects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    duration: { type: Number, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    totalSeats: { type: Number, required: true },
    description: { type: String },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>("Course", CourseSchema);
