/**
 * Analytics Dashboard Controller
 * 
 * Handles HTTP request/response logic for dashboard analytics
 * Delegates business logic to AnalyticsService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { AnalyticsService } from '@/lib/services/analytics.service';

const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics data
 */
export async function getDashboard(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const dashboard = await analyticsService.getDashboard({ date });

    return NextResponse.json({
      success: true,
      dashboard,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
