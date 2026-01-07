/**
 * Auth Service
 * 
 * Contains business logic for authentication operations
 */

import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, hashPassword, generateToken } from '@/lib/auth';

export interface LoginResult {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  token: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: string;
  employeeId?: string;
}

export class AuthService {
  /**
   * Authenticate user and generate token
   */
  async login(email: string, password: string): Promise<LoginResult> {
    await connectDB();

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      const error: any = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Register a new user
   */
  async register(params: RegisterParams): Promise<LoginResult> {
    await connectDB();

    const { email, password, name, role, employeeId } = params;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error: any = new Error('User already exists');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      employeeId,
    });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
      token,
    };
  }
}
