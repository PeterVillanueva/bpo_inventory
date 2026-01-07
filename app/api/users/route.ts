/**
 * Users API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getUsers } from './controller';

export const GET = withAuth(getUsers, ['ADMIN', 'OWNER']);

