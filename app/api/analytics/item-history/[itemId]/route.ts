/**
 * Item History API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getItemHistory } from './controller';

export const GET = withAuth(getItemHistory, ['ADMIN', 'OWNER']);

