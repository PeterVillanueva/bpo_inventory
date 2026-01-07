/**
 * Movement Request Service
 * 
 * Contains business logic for movement request operations
 */

import connectDB from '@/lib/db';
import MovementRequest from '@/models/MovementRequest';
import Item from '@/models/Item';
import { JWTPayload } from '@/lib/auth';
import { ActionType, Location } from '@/lib/types';
import { executeWritePipeline } from '@/lib/write-pipeline';

export interface GetMovementRequestsParams {
  user: JWTPayload;
  status?: string;
}

export interface CreateMovementRequestParams {
  itemId: string;
  userId: string;
  action: string;
  reason: string;
  location: string;
  userRole: string;
}

export interface MovementRequestDTO {
  id: string;
  itemId: string;
  item: {
    qrCode: string;
    identityCode: string;
    itemType: string;
  };
  userId: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  reason: string;
  status: string;
  requestedAt: Date;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  reviewedAt?: Date | null;
}

export class MovementRequestService {
  /**
   * Get movement requests with role-based filtering
   */
  async getMovementRequests(params: GetMovementRequestsParams): Promise<MovementRequestDTO[]> {
    await connectDB();

    const { user, status } = params;
    let query: any = {};

    // BPO users only see their own requests
    if (user.role === 'BPO') {
      query.userId = user.userId;
    }

    if (status) {
      query.status = status;
    }

    const requests = await MovementRequest.find(query)
      .populate('itemId', 'qrCode identityCode itemType')
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ requestedAt: -1 })
      .limit(100);

    return requests.map((req) => ({
      id: req._id.toString(),
      itemId: req.itemId._id.toString(),
      item: {
        qrCode: (req.itemId as any).qrCode,
        identityCode: (req.itemId as any).identityCode,
        itemType: (req.itemId as any).itemType,
      },
      userId: req.userId._id.toString(),
      user: {
        name: (req.userId as any).name,
        email: (req.userId as any).email,
      },
      action: req.action,
      reason: req.reason,
      status: req.status,
      requestedAt: req.requestedAt,
      reviewedBy: req.reviewedBy
        ? {
            id: req.reviewedBy._id.toString(),
            name: (req.reviewedBy as any).name,
            email: (req.reviewedBy as any).email,
          }
        : null,
      reviewedAt: req.reviewedAt,
    }));
  }

  /**
   * Create a new movement request
   */
  async createMovementRequest(params: CreateMovementRequestParams): Promise<MovementRequestDTO> {
    await connectDB();

    const { itemId, userId, action, reason, location, userRole } = params;

    const validActions: ActionType[] = [
      'REQUEST_REPAIR',
      'REQUEST_DISPOSE',
      'REQUEST_BORROW',
      'REQUEST_TRANSFER_FLOOR_1',
      'REQUEST_TRANSFER_FLOOR_2',
      'REQUEST_TRANSFER_FLOOR_3',
    ];

    if (!validActions.includes(action as ActionType)) {
      const error: any = new Error('Invalid action type');
      error.statusCode = 400;
      throw error;
    }

    const item = await Item.findById(itemId);
    if (!item) {
      const error: any = new Error('Item not found');
      error.statusCode = 404;
      throw error;
    }

    // BPO users can only request for their assigned items
    if (userRole === 'BPO') {
      if (item.assignedUserId?.toString() !== userId) {
        const error: any = new Error('Item not assigned to you');
        error.statusCode = 403;
        throw error;
      }
    }

    const movementRequest = await MovementRequest.create({
      itemId,
      userId,
      action: action as ActionType,
      reason,
      status: 'pending',
      requestedAt: new Date(),
    });

    // Log the request
    await executeWritePipeline(
      itemId,
      userId,
      action as ActionType,
      location as Location,
      reason
    );

    return {
      id: movementRequest._id.toString(),
      itemId: movementRequest.itemId.toString(),
      item: {
        qrCode: item.qrCode,
        identityCode: item.identityCode,
        itemType: item.itemType,
      },
      userId: movementRequest.userId.toString(),
      user: {
        name: '', // Will be populated if needed
        email: '',
      },
      action: movementRequest.action,
      reason: movementRequest.reason,
      status: movementRequest.status,
      requestedAt: movementRequest.requestedAt,
      reviewedBy: null,
      reviewedAt: null,
    };
  }

  /**
   * Review (approve/reject) a movement request
   */
  async reviewRequest(params: {
    requestId: string;
    status: 'approved' | 'rejected';
    location?: string;
    adminId: string;
    adminEmail: string;
  }): Promise<{
    id: string;
    status: string;
    reviewedBy: string;
    reviewedAt: Date;
  }> {
    await connectDB();

    const { requestId, status, location, adminId, adminEmail } = params;

    const movementRequest = await MovementRequest.findById(requestId)
      .populate('itemId')
      .populate('userId');

    if (!movementRequest) {
      const error: any = new Error('Movement request not found');
      error.statusCode = 404;
      throw error;
    }

    if (movementRequest.status !== 'pending') {
      const error: any = new Error('Request already reviewed');
      error.statusCode = 400;
      throw error;
    }

    // Update request status
    movementRequest.status = status;
    movementRequest.reviewedBy = adminId as any;
    movementRequest.reviewedAt = new Date();
    await movementRequest.save();

    const item = movementRequest.itemId as any;

    // If approved, execute the action
    if (status === 'approved') {
      // Update item status based on action
      if (movementRequest.action === 'REQUEST_REPAIR') {
        item.status = 'repair';
      } else if (movementRequest.action === 'REQUEST_DISPOSE') {
        item.status = 'disposed';
      } else if (movementRequest.action === 'REQUEST_BORROW') {
        item.status = 'borrowed';
      }
      // Transfer actions don't change item status, just location

      await item.save();

      // Log approval
      await executeWritePipeline(
        item._id.toString(),
        movementRequest.userId.toString(),
        'APPROVED',
        (location || 'Storage') as Location,
        `Request approved by admin ${adminEmail}`,
        item.itemType
      );
    } else {
      // Log rejection
      await executeWritePipeline(
        item._id.toString(),
        movementRequest.userId.toString(),
        'REJECTED',
        (location || 'Storage') as Location,
        `Request rejected by admin ${adminEmail}`,
        item.itemType
      );
    }

    return {
      id: movementRequest._id.toString(),
      status: movementRequest.status,
      reviewedBy: movementRequest.reviewedBy.toString(),
      reviewedAt: movementRequest.reviewedAt!,
    };
  }
}
