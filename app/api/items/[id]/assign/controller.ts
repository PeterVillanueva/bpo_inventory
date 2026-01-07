/**
 * Item Assignment Controller
 * 
 * Handles HTTP request/response logic for item assignment
 * Delegates business logic to ItemService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { ItemService } from '@/lib/services/item.service';

const itemService = new ItemService();

/**
 * POST /api/items/[id]/assign
 * Assign an item to a user
 */
export async function assignItem(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { userId, location } = body;
    const adminId = req.user!.userId;
    const adminEmail = req.user!.email;

    if (!userId || !location) {
      return NextResponse.json(
        { error: 'User ID and location are required' },
        { status: 400 }
      );
    }

    const result = await itemService.assignItem({
      itemId: params.id,
      userId,
      location,
      adminId,
      adminEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'Item assigned successfully',
      item: result,
    });
  } catch (error: any) {
    console.error('Assign item error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
