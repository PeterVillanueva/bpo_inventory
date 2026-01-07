/**
 * Items API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { getItems, createItem } from './controller';

export const GET = withAuth(getItems);
export const POST = withAuth(createItem, ['ADMIN']);

