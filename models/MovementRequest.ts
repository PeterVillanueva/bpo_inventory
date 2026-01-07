import mongoose, { Schema, Document } from 'mongoose';
import { ActionType, MovementRequestStatus } from '@/lib/types';

/**
 * WORKFLOW LAYER
 * 
 * Purpose: Approval flow management (not a log)
 * - Tracks pending/approved/rejected requests
 * - Links to item_logs when approved
 * - Enables admin review workflows
 */
export interface IMovementRequest extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: ActionType;
  reason: string; // Required remarks
  status: MovementRequestStatus;
  requestedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MovementRequestSchema = new Schema<IMovementRequest>(
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
    action: {
      type: String,
      enum: [
        'REQUEST_REPAIR',
        'REQUEST_DISPOSE',
        'REQUEST_BORROW',
        'REQUEST_TRANSFER_FLOOR_1',
        'REQUEST_TRANSFER_FLOOR_2',
        'REQUEST_TRANSFER_FLOOR_3',
      ],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
      index: true,
    },
    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
MovementRequestSchema.index({ status: 1, requestedAt: -1 }); // Pending requests
MovementRequestSchema.index({ userId: 1, status: 1 }); // User requests
MovementRequestSchema.index({ itemId: 1, status: 1 }); // Item requests

export default mongoose.models.MovementRequest || mongoose.model<IMovementRequest>('MovementRequest', MovementRequestSchema);

