/**
 * Item History Controller
 * 
 * Handles HTTP request/response logic for item history analytics
 * Delegates business logic to AnalyticsService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { AnalyticsService } from '@/lib/services/analytics.service';

const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/item-history/[itemId]
 * Get item history
 */
export async function getItemHistory(
  req: AuthenticatedRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    const history = await analyticsService.getItemHistory({
      itemId: params.itemId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error('Item history error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
