import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacement extends Document {
  companyName: string;
  role: string;
  package: number; // LPA
  deadline: Date;
  eligibilityGPA: number;
  eligibilityBacklogs: number;
  collegeId: mongoose.Types.ObjectId;
  description: string;
  status: 'open' | 'closed';
}

const PlacementSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  package: { type: Number, required: true },
  deadline: { type: Date, required: true },
  eligibilityGPA: { type: Number, default: 0 },
  eligibilityBacklogs: { type: Number, default: 0 },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
}, { timestamps: true });

export default mongoose.model<IPlacement>('Placement', PlacementSchema);
