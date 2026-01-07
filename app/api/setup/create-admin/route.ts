/**
 * One-Time Admin Creation Endpoint
 * 
 * This endpoint allows creating the first admin user without authentication.
 * After creating the first admin, you should disable or protect this endpoint.
 * 
 * To disable: Delete this file or add authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      return NextResponse.json(
        { 
          error: 'Admin user already exists. Please use the registration API after logging in.',
          hint: 'If you need to create another admin, login as admin and use /api/auth/register'
        },
        { status: 400 }
      );
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const admin = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      warning: 'Please disable or protect this endpoint after setup.',
    });
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

