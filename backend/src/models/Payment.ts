import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  feeStructureId: mongoose.Types.ObjectId;
  amountPaid: number;
  fineApplied: number;
  paymentDate: Date;
  mode: "cash" | "cheque" | "online";
  receiptNumber: string; // auto-generated
  status: "Paid" | "Partial" | "Pending";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    feeStructureId: { type: Schema.Types.ObjectId, ref: "FeeStructure", required: true },
    amountPaid: { type: Number, required: true },
    fineApplied: { type: Number, default: 0 },
    paymentDate: { type: Date, default: Date.now },
    mode: { type: String, enum: ["cash", "cheque", "online"], required: true },
    receiptNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ["Paid", "Partial", "Pending"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
