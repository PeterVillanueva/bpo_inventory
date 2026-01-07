/**
 * Movement Request Review Controller
 * 
 * Handles HTTP request/response logic for reviewing movement requests
 * Delegates business logic to MovementRequestService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { MovementRequestService } from '@/lib/services/movement-request.service';

const movementRequestService = new MovementRequestService();

/**
 * POST /api/movement-requests/[id]/review
 * Review (approve/reject) a movement request
 */
export async function reviewMovementRequest(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, location } = body;
    const adminId = req.user!.userId;
    const adminEmail = req.user!.email;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (approved/rejected) is required' },
        { status: 400 }
      );
    }

    const result = await movementRequestService.reviewRequest({
      requestId: params.id,
      status: status as 'approved' | 'rejected',
      location,
      adminId,
      adminEmail,
    });

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
      request: result,
    });
  } catch (error: any) {
    console.error('Review movement request error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
