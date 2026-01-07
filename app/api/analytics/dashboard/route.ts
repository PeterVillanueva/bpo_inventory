/**
 * Analytics Dashboard API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getDashboard } from './controller';

export const GET = withAuth(getDashboard, ['ADMIN', 'OWNER']);

