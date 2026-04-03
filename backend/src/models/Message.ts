import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  senderRole: 'TEACHER' | 'STUDENT' | 'PARENT' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';
  content: string;
  collegeId: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["TEACHER", "STUDENT", "PARENT", "COLLEGE_ADMIN", "SUPER_ADMIN"], required: true },
    content: { type: String, required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for efficient conversation lookups
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ collegeId: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
