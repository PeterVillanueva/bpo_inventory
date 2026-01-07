/**
 * Item Scan Controller
 * 
 * Handles HTTP request/response logic for item scanning
 * Delegates business logic to ItemService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { ItemService } from '@/lib/services/item.service';

const itemService = new ItemService();

/**
 * POST /api/items/scan
 * Scan an item (scan in/out)
 */
export async function scanItem(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const { qrCode, identityCode, action, location, remarks } = body;
    const user = req.user!;

    if (!action || !location) {
      return NextResponse.json(
        { error: 'Action and location are required' },
        { status: 400 }
      );
    }

    const result = await itemService.scanItem({
      qrCode,
      identityCode,
      action,
      location,
      remarks,
      userId: user.userId,
      userRole: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Item scanned successfully',
      item: result,
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
