/**
 * Auth Register API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { register } from './controller';

export const POST = withAuth(register, ['ADMIN']);

