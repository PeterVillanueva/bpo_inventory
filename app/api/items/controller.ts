/**
 * Items Controller
 * 
 * Handles HTTP request/response logic for items endpoints
 * Delegates business logic to ItemService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { ItemService } from '@/lib/services/item.service';

const itemService = new ItemService();

/**
 * GET /api/items
 * Get items with optional filtering
 */
export async function getItems(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const itemType = searchParams.get('itemType');
    const assignedToMe = searchParams.get('assignedToMe') === 'true';

    const items = await itemService.getItems({
      user,
      status: status || undefined,
      itemType: itemType || undefined,
      assignedToMe,
    });

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new item
 */
export async function createItem(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { qrCode, identityCode, itemType, status } = body;

    if (!qrCode || !identityCode || !itemType) {
      return NextResponse.json(
        { error: 'QR code, identity code, and item type are required' },
        { status: 400 }
      );
    }

    const item = await itemService.createItem({
      qrCode,
      identityCode,
      itemType,
      status: status || 'available',
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error('Create item error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'QR code or identity code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
