/**
 * Auth Login Controller
 * 
 * Handles HTTP request/response logic for login endpoint
 * Delegates business logic to AuthService
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth.service';

const authService = new AuthService();

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
export async function login(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authService.login(email, password);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
    });

    // Set HTTP-only cookie
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
