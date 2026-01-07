/**
 * User Service
 * 
 * Contains business logic for user operations
 */

import connectDB from '@/lib/db';
import User from '@/models/User';

export interface GetUsersParams {
  role?: string;
}

export interface UserDTO {
  id: string;
  email: string;
  role: string;
  name: string;
  employeeId?: string;
  createdAt: Date;
}

export class UserService {
  /**
   * Get users with optional role filtering
   */
  async getUsers(params: GetUsersParams): Promise<UserDTO[]> {
    await connectDB();

    const { role } = params;
    let query: any = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      employeeId: user.employeeId,
      createdAt: user.createdAt,
    }));
  }
}
