/**
 * Item Scan API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware';
import { scanItem } from './controller';

export const POST = withAuth(scanItem, ['ADMIN', 'BPO']);

