import mongoose, { Schema, Document } from 'mongoose';
import { ItemType } from '@/lib/types';

/**
 * PERFORMANCE VIEW - TIME-BASED ACCOUNTABILITY
 * 
 * Purpose: Duration tracking and time-based analytics
 * - Pre-calculated usage durations
 * - Fast dashboard queries
 * - Supports "who used what for how long" queries
 * - Updated via write pipeline
 */
export interface IDailyUsageSnapshot extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  itemsUsed: Array<{
    itemId: mongoose.Types.ObjectId;
    itemType: ItemType;
    scanIn: Date;
    scanOut?: Date;
    durationMinutes?: number;
  }>;
  totalDurationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyUsageSnapshotSchema = new Schema<IDailyUsageSnapshot>(
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
    itemsUsed: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
        },
        itemType: {
          type: String,
          required: true,
        },
        scanIn: {
          type: Date,
          required: true,
        },
        scanOut: Date,
        durationMinutes: Number,
      },
    ],
    totalDurationMinutes: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one snapshot per user per day
DailyUsageSnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

// Indexes for analytics
DailyUsageSnapshotSchema.index({ date: -1, totalDurationMinutes: -1 }); // Daily usage ranking
DailyUsageSnapshotSchema.index({ userId: 1, date: -1 }); // User usage timeline

export default mongoose.models.DailyUsageSnapshot || mongoose.model<IDailyUsageSnapshot>('DailyUsageSnapshot', DailyUsageSnapshotSchema);

