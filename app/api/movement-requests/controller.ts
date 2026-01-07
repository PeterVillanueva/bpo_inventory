/**
 * Movement Requests Controller
 * 
 * Handles HTTP request/response logic for movement requests endpoints
 * Delegates business logic to MovementRequestService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { MovementRequestService } from '@/lib/services/movement-request.service';

const movementRequestService = new MovementRequestService();

/**
 * GET /api/movement-requests
 * Get movement requests with optional filtering
 */
export async function getMovementRequests(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const requests = await movementRequestService.getMovementRequests({
      user,
      status: status || undefined,
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    console.error('Get movement requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/movement-requests
 * Create a new movement request
 */
export async function createMovementRequest(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { itemId, action, reason, location } = body;
    const userId = req.user!.userId;

    if (!itemId || !action || !reason || !location) {
      return NextResponse.json(
        { error: 'Item ID, action, reason, and location are required' },
        { status: 400 }
      );
    }

    const request = await movementRequestService.createMovementRequest({
      itemId,
      userId,
      action,
      reason,
      location,
      userRole: req.user!.role,
    });

    return NextResponse.json({
      success: true,
      request,
    });
  } catch (error: any) {
    console.error('Create movement request error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
