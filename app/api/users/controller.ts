/**
 * Users Controller
 * 
 * Handles HTTP request/response logic for users endpoints
 * Delegates business logic to UserService
 */

import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from '@/lib/middleware';
import { UserService } from '@/lib/services/user.service';

const userService = new UserService();

/**
 * GET /api/users
 * Get users with optional role filtering
 */
export async function getUsers(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const users = await userService.getUsers({
      role: role || undefined,
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
