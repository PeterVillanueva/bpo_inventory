/**
 * Movement Requests API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getMovementRequests, createMovementRequest } from './controller';

export const GET = withAuth(getMovementRequests);
export const POST = withAuth(createMovementRequest, ['ADMIN', 'BPO']);

