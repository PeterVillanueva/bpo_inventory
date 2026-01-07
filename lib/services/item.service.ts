/**
 * Item Service
 * 
 * Contains business logic for item operations
 * Handles database queries, data transformation, and business rules
 */

import connectDB from '@/lib/db';
import Item from '@/models/Item';
import { JWTPayload } from '@/lib/auth';
import { executeWritePipeline } from '@/lib/write-pipeline';
import { Location, ActionType } from '@/lib/types';

export interface GetItemsParams {
  user: JWTPayload;
  status?: string;
  itemType?: string;
  assignedToMe?: boolean;
}

export interface CreateItemParams {
  qrCode: string;
  identityCode: string;
  itemType: string;
  status: string;
}

export interface ItemDTO {
  id: string;
  qrCode: string;
  identityCode: string;
  itemType: string;
  status: string;
  assignedUserId?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
}

export class ItemService {
  /**
   * Get items with role-based filtering
   */
  async getItems(params: GetItemsParams): Promise<ItemDTO[]> {
    await connectDB();

    const { user, status, itemType, assignedToMe } = params;
    let query: any = {};

    // BPO users only see their assigned items
    if (user.role === 'BPO') {
      query.assignedUserId = user.userId;
    }

    if (status) {
      query.status = status;
    }

    if (itemType) {
      query.itemType = itemType;
    }

    if (assignedToMe && user.role !== 'BPO') {
      query.assignedUserId = user.userId;
    }

    const items = await Item.find(query)
      .populate('assignedUserId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    return items.map((item) => ({
      id: item._id.toString(),
      qrCode: item.qrCode,
      identityCode: item.identityCode,
      itemType: item.itemType,
      status: item.status,
      assignedUserId: item.assignedUserId
        ? {
            id: item.assignedUserId._id.toString(),
            name: (item.assignedUserId as any).name,
            email: (item.assignedUserId as any).email,
          }
        : null,
      createdAt: item.createdAt,
    }));
  }

  /**
   * Create a new item
   */
  async createItem(params: CreateItemParams): Promise<ItemDTO> {
    await connectDB();

    const { qrCode, identityCode, itemType, status } = params;

    const item = await Item.create({
      qrCode,
      identityCode: identityCode.toUpperCase(),
      itemType,
      status: status || 'available',
    });

    return {
      id: item._id.toString(),
      qrCode: item.qrCode,
      identityCode: item.identityCode,
      itemType: item.itemType,
      status: item.status,
      assignedUserId: null,
      createdAt: item.createdAt,
    };
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string): Promise<ItemDTO | null> {
    await connectDB();

    const item = await Item.findById(itemId).populate('assignedUserId', 'name email');

    if (!item) {
      return null;
    }

    return {
      id: item._id.toString(),
      qrCode: item.qrCode,
      identityCode: item.identityCode,
      itemType: item.itemType,
      status: item.status,
      assignedUserId: item.assignedUserId
        ? {
            id: item.assignedUserId._id.toString(),
            name: (item.assignedUserId as any).name,
            email: (item.assignedUserId as any).email,
          }
        : null,
      createdAt: item.createdAt,
    };
  }

  /**
   * Assign an item to a user
   */
  async assignItem(params: {
    itemId: string;
    userId: string;
    location: string;
    adminId: string;
    adminEmail: string;
  }): Promise<{
    id: string;
    qrCode: string;
    identityCode: string;
    itemType: string;
    status: string;
    assignedUserId: string;
  }> {
    await connectDB();

    const { itemId, userId, location, adminEmail } = params;

    const item = await Item.findById(itemId);
    if (!item) {
      const error: any = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    // Unassign previous user if exists
    if (item.assignedUserId) {
      await executeWritePipeline(
        item._id.toString(),
        item.assignedUserId.toString(),
        'UNASSIGNED',
        location as Location,
        `Unassigned by admin ${adminEmail}`
      );
    }

    // Assign to new user
    item.assignedUserId = userId;
    item.status = 'assigned';
    await item.save();

    // Log assignment
    await executeWritePipeline(
      item._id.toString(),
      userId,
      'ASSIGNED',
      location as Location,
      `Assigned by admin ${adminEmail}`,
      item.itemType
    );

    return {
      id: item._id.toString(),
      qrCode: item.qrCode,
      identityCode: item.identityCode,
      itemType: item.itemType,
      status: item.status,
      assignedUserId: item.assignedUserId.toString(),
    };
  }

  /**
   * Scan an item (scan in/out)
   */
  async scanItem(params: {
    qrCode?: string;
    identityCode?: string;
    action: string;
    location: string;
    remarks?: string;
    userId: string;
    userRole: string;
  }): Promise<{
    id: string;
    qrCode: string;
    identityCode: string;
    itemType: string;
    status: string;
  }> {
    await connectDB();

    const { qrCode, identityCode, action, location, remarks, userId, userRole } = params;

    // Validate action type
    const validActions: ActionType[] = ['SCAN_IN', 'SCAN_OUT'];
    if (!validActions.includes(action as ActionType)) {
      const error: any = new Error('Invalid action type');
      error.statusCode = 400;
      throw error;
    }

    // Find item by QR code or identity code
    const item = qrCode
      ? await Item.findOne({ qrCode })
      : await Item.findOne({ identityCode: identityCode?.toUpperCase() });

    if (!item) {
      const error: any = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    // For BPO users, verify item is assigned to them
    if (userRole === 'BPO') {
      if (item.assignedUserId?.toString() !== userId) {
        const error: any = new Error('Item not assigned to you');
        error.statusCode = 403;
        throw error;
      }
    }

    // Execute write pipeline
    await executeWritePipeline(
      item._id.toString(),
      userId,
      action as ActionType,
      location as Location,
      remarks,
      item.itemType
    );

    // Update item status if needed
    if (action === 'SCAN_IN') {
      await Item.findByIdAndUpdate(item._id, {
        status: 'assigned',
        assignedUserId: userId,
      });
      item.status = 'assigned';
      item.assignedUserId = userId as any;
    }

    return {
      id: item._id.toString(),
      qrCode: item.qrCode,
      identityCode: item.identityCode,
      itemType: item.itemType,
      status: item.status,
    };
  }
}
