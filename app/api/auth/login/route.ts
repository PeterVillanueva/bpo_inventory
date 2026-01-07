/**
 * Auth Login API Route
 * 
 * Thin HTTP layer that delegates to controller
 */

import { NextRequest } from 'next/server';
import { login } from './controller';

export const POST = login;

