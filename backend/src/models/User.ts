import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  collegeId?: mongoose.Types.ObjectId;
  registrationId?: string;
  isActive: boolean;
  profilePicture?: string;
  phone?: string;
  authentication: {
    two_factor_enabled: boolean;
    two_factor_method: 'email' | 'sms' | 'authenticator_app';
    last_login?: Date;
    login_count: number;
    failed_login_attempts: number;
    account_locked_until?: Date;
  };
  permissions: {
    role_based: string[];
    custom_permissions: string[];
  };
  matchPassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College' },
  registrationId: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  profilePicture: { type: String },
  phone: { type: String },
  authentication: {
    two_factor_enabled: { type: Boolean, default: false },
    two_factor_method: { type: String, enum: ['email', 'sms', 'authenticator_app'], default: 'email' },
    last_login: { type: Date },
    login_count: { type: Number, default: 0 },
    failed_login_attempts: { type: Number, default: 0 },
    account_locked_until: { type: Date }
  },
  permissions: {
    role_based: { type: [String], default: [] },
    custom_permissions: { type: [String], default: [] }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password as string);
};

export default mongoose.model<IUser>('User', UserSchema);
