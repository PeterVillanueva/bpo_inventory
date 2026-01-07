import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/lib/types';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'BPO'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common queries
UserSchema.index({ role: 1, email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

