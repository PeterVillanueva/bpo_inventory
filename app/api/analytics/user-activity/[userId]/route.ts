/**
 * User Activity API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getUserActivity } from './controller';

export const GET = withAuth(getUserActivity, ['ADMIN', 'OWNER']);

