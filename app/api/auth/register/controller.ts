/**
 * Auth Register Controller
 * 
 * Handles HTTP request/response logic for register endpoint
 * Delegates business logic to AuthService
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

const authService = new AuthService();

/**
 * POST /api/auth/register
 * Register a new user (Admin only)
 */
export async function register(req: NextRequest) {
  try {
    const { email, password, name, role, employeeId } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    const result = await authService.register({
      email,
      password,
      name,
      role,
      employeeId,
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
