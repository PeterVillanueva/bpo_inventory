import mongoose, { Schema, Document } from 'mongoose';

/**
 * CONFIGURABLE SYSTEM VALUES
 * 
 * Purpose: Admin-configurable settings
 * - Company name, printer settings, etc.
 * - Key-value store with descriptions
 */
export interface ISystemSetting extends Document {
  key: string;
  value: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SystemSetting || mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);

