import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  courseId: mongoose.Types.ObjectId;
  year: number;
  sections: string[];
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    year: { type: Number, required: true },
    sections: [{ type: String }],
    students: [{ type: Schema.Types.ObjectId, ref: "Student" }],
  },
  { timestamps: true }
);

export default mongoose.model<IBatch>("Batch", BatchSchema);
