import mongoose, { Schema, Document } from 'mongoose';
import { ActionType, Location } from '@/lib/types';

/**
 * CANONICAL AUDIT TRAIL
 * 
 * Purpose: Single source of truth for all item movements
 * - Immutable append-only log
 * - Legal-grade audit history
 * - No updates or deletes allowed
 * - Partitioned by date for performance
 */
export interface IItemLog extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  actionType: ActionType;
  timestamp: Date;
  date: string; // YYYY-MM-DD format for partitioning and fast queries
  location: Location;
  remarks?: string;
  createdAt: Date; // System timestamp (immutable)
}

const ItemLogSchema = new Schema<IItemLog>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        'SCAN_IN',
        'SCAN_OUT',
        'REQUEST_REPAIR',
        'REQUEST_DISPOSE',
        'REQUEST_BORROW',
        'REQUEST_TRANSFER_FLOOR_1',
        'REQUEST_TRANSFER_FLOOR_2',
        'REQUEST_TRANSFER_FLOOR_3',
        'APPROVED',
        'REJECTED',
        'ASSIGNED',
        'UNASSIGNED',
      ],
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
      // Format: YYYY-MM-DD
    },
    location: {
      type: String,
      enum: ['Floor 1', 'Floor 2', 'Floor 3', 'Repair', 'Storage', 'Disposed'],
      required: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt, no updates
  }
);

// Compound indexes for common query patterns
ItemLogSchema.index({ itemId: 1, timestamp: -1 }); // Item history
ItemLogSchema.index({ userId: 1, timestamp: -1 }); // User activity
ItemLogSchema.index({ date: 1, actionType: 1 }); // Daily reports
ItemLogSchema.index({ itemId: 1, date: -1, timestamp: -1 }); // Item timeline
ItemLogSchema.index({ userId: 1, date: -1, timestamp: -1 }); // User timeline
ItemLogSchema.index({ location: 1, date: -1 }); // Location tracking

// TTL index for old logs (optional - remove if you want permanent retention)
// ItemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

export default mongoose.models.ItemLog || mongoose.model<IItemLog>('ItemLog', ItemLogSchema);

