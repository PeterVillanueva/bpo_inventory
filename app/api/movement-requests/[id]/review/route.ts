/**
 * Movement Request Review API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { reviewMovementRequest } from './controller';

export const POST = withAuth(reviewMovementRequest, ['ADMIN']);

