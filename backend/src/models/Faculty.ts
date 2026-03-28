import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string; // unique, auto-generated
  personalInfo: {
    name: string;
    dob: Date;
    gender: "male" | "female" | "other";
    phone: string;
    email: string;
    address: string;
    photo?: string;
  };
  qualification: {
    degree: string;
    institution: string;
    year: number;
    specialization: string;
  }[];
  experience: number; // years
  department: string;
  assignedSubjects: mongoose.Types.ObjectId[];
  status: "Active" | "On-Leave" | "Resigned";
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    personalInfo: {
      name: { type: String, required: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ["male", "female", "other"], required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      address: { type: String, required: true },
      photo: { type: String },
    },
    qualification: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
        specialization: { type: String, required: true },
      },
    ],
    experience: { type: Number, default: 0 },
    department: { type: String, required: true },
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    status: {
      type: String,
      enum: ["Active", "On-Leave", "Resigned"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFaculty>("Faculty", FacultySchema);
