import mongoose, { Schema, Document } from 'mongoose';
import { ItemType, ItemStatus } from '@/lib/types';

export interface IItem extends Document {
  qrCode: string;
  itemType: ItemType;
  status: ItemStatus;
  assignedUserId?: mongoose.Types.ObjectId;
  identityCode: string; // Manual fallback code (e.g., "MON-001")
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    qrCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    identityCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    itemType: {
      type: String,
      enum: ['Headset', 'Monitor', 'Keyboard', 'Mouse', 'System Unit', 'AVR', 'UPS'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'repair', 'disposed', 'borrowed'],
      required: true,
      default: 'available',
      index: true,
    },
    assignedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
ItemSchema.index({ status: 1, itemType: 1 });
ItemSchema.index({ assignedUserId: 1, status: 1 });
ItemSchema.index({ qrCode: 1, status: 1 });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);

