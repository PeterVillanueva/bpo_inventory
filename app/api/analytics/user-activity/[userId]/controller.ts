/**
 * User Activity Controller
 * 
 * Handles HTTP request/response logic for user activity analytics
 * Delegates business logic to AnalyticsService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { AnalyticsService } from '@/lib/services/analytics.service';

const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/user-activity/[userId]
 * Get user activity
 */
export async function getUserActivity(
  req: AuthenticatedRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');

    const activities = await analyticsService.getUserActivity({
      userId: params.userId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error: any) {
    console.error('User activity error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
