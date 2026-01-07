/**
 * Item Assignment API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { assignItem } from './controller';

export const POST = withAuth(assignItem, ['ADMIN']);

