import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';
import { UserRole } from './types';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                   req.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = payload;

      return handler(authenticatedReq, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

