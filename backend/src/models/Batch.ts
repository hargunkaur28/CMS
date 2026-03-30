import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  startYear: number;
  endYear: number;
  currentSemester: number;
  sections: string[];
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number, required: true },
    currentSemester: { type: Number, default: 1 },
    sections: [{ type: String, default: ["A"] }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

export default mongoose.model<IBatch>("Batch", BatchSchema);
