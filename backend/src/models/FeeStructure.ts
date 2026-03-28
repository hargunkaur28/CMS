import mongoose, { Schema, Document } from "mongoose";

export interface IFeeStructure extends Document {
  courseId: mongoose.Types.ObjectId;
  semester: number;
  components: {
    name: string; // tuition, exam, lab, misc
    amount: number;
  }[];
  dueDate: Date;
  finePerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: Number, required: true },
    components: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    dueDate: { type: Date, required: true },
    finePerDay: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);
