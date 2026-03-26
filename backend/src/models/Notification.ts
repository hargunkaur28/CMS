import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'announcement' | 'alert' | 'personal';
  recipientRole?: string; // e.g., STUDENT, TEACHER
  recipientUserId?: mongoose.Types.ObjectId;
  senderUserId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  isRead: boolean;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'alert', 'personal'], default: 'announcement' },
  recipientRole: { type: String },
  recipientUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  senderUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
