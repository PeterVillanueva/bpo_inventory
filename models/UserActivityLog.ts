import mongoose, { Schema, Document } from 'mongoose';
import { ActionType, Location } from '@/lib/types';

/**
 * USER-CENTRIC READ MODEL
 * 
 * Purpose: Fast admin queries without aggregation
 * - Pre-aggregated user activity by date
 * - Zero aggregation scans for dashboards
 * - Updated via write pipeline after each action
 * - Enables instant user accountability queries
 */
export interface IUserActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  activities: Array<{
    itemId: mongoose.Types.ObjectId;
    actionType: ActionType;
    timestamp: Date;
    location: Location;
    remarks?: string;
  }>;
  totalActions: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserActivityLogSchema = new Schema<IUserActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    activities: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        actionType: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          required: true,
        },
        location: {
          type: String,
          required: true,
        },
        remarks: String,
      },
    ],
    totalActions: {
      type: Number,
      required: true,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one document per user per day
UserActivityLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Indexes for admin queries
UserActivityLogSchema.index({ date: -1, totalActions: -1 }); // Daily activity ranking
UserActivityLogSchema.index({ userId: 1, date: -1 }); // User timeline
UserActivityLogSchema.index({ lastActivityAt: -1 }); // Recent activity

export default mongoose.models.UserActivityLog || mongoose.model<IUserActivityLog>('UserActivityLog', UserActivityLogSchema);

