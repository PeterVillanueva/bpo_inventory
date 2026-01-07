/**
 * Analytics Service
 * 
 * Contains business logic for analytics operations
 */

import connectDB from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import ItemLog from '@/models/ItemLog';
import UserActivityLog from '@/models/UserActivityLog';
import DailyUsageSnapshot from '@/models/DailyUsageSnapshot';
import MovementRequest from '@/models/MovementRequest';

export interface GetDashboardParams {
  date: string;
}

export interface DashboardDTO {
  overview: {
    totalItems: number;
    assignedItems: number;
    availableItems: number;
    repairItems: number;
    disposedItems: number;
    totalUsers: number;
    pendingRequests: number;
  };
  todayActivity: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    totalActions: number;
    lastActivityAt: Date;
  }>;
  todayUsage: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    totalDurationMinutes: number;
    itemsUsed: number;
  }>;
  recentActivity: Array<{
    id: string;
    itemId: string;
    itemQrCode: string;
    itemType: string;
    userId: string;
    userName: string;
    actionType: string;
    timestamp: Date;
    location: string;
    remarks?: string;
  }>;
}

export class AnalyticsService {
  /**
   * Get dashboard analytics data
   */
  async getDashboard(params: GetDashboardParams): Promise<DashboardDTO> {
    await connectDB();

    const { date } = params;

    // Get statistics using materialized views (no aggregation needed)
    const [
      totalItems,
      assignedItems,
      availableItems,
      repairItems,
      disposedItems,
      totalUsers,
      todayActivityLogs,
      todayUsageSnapshots,
      pendingRequests,
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'assigned' }),
      Item.countDocuments({ status: 'available' }),
      Item.countDocuments({ status: 'repair' }),
      Item.countDocuments({ status: 'disposed' }),
      User.countDocuments({ role: 'BPO' }),
      UserActivityLog.find({ date }).limit(50).populate('userId', 'name email'),
      DailyUsageSnapshot.find({ date }).limit(50).populate('userId', 'name email'),
      MovementRequest.countDocuments({ status: 'pending' }),
    ]);

    // Get recent activity from logs (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentLogs = await ItemLog.find({
      timestamp: { $gte: yesterday },
    })
      .populate('itemId', 'qrCode itemType')
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(20);

    return {
      overview: {
        totalItems,
        assignedItems,
        availableItems,
        repairItems,
        disposedItems,
        totalUsers,
        pendingRequests,
      },
      todayActivity: todayActivityLogs.map((log: any) => ({
        userId: log.userId._id.toString(),
        userName: (log.userId as any).name,
        userEmail: (log.userId as any).email,
        totalActions: log.totalActions,
        lastActivityAt: log.lastActivityAt,
      })),
      todayUsage: todayUsageSnapshots.map((snapshot: any) => ({
        userId: snapshot.userId._id.toString(),
        userName: (snapshot.userId as any).name,
        userEmail: (snapshot.userId as any).email,
        totalDurationMinutes: snapshot.totalDurationMinutes,
        itemsUsed: snapshot.itemsUsed.length,
      })),
      recentActivity: recentLogs.map((log: any) => ({
        id: log._id.toString(),
        itemId: log.itemId._id.toString(),
        itemQrCode: (log.itemId as any).qrCode,
        itemType: (log.itemId as any).itemType,
        userId: log.userId._id.toString(),
        userName: (log.userId as any).name,
        actionType: log.actionType,
        timestamp: log.timestamp,
        location: log.location,
        remarks: log.remarks,
      })),
    };
  }

  /**
   * Get item history
   */
  async getItemHistory(params: {
    itemId: string;
    startDate?: string;
    endDate?: string;
    limit: number;
  }): Promise<Array<{
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    actionType: string;
    timestamp: Date;
    date: string;
    location: string;
    remarks?: string;
  }>> {
    await connectDB();

    const { itemId, startDate, endDate, limit } = params;

    let query: any = { itemId };

    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const logs = await ItemLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit);

    return logs.map((log) => ({
      id: log._id.toString(),
      userId: log.userId._id.toString(),
      userName: (log.userId as any).name,
      userEmail: (log.userId as any).email,
      actionType: log.actionType,
      timestamp: log.timestamp,
      date: log.date,
      location: log.location,
      remarks: log.remarks,
    }));
  }

  /**
   * Get user activity
   */
  async getUserActivity(params: {
    userId: string;
    startDate?: string;
    endDate?: string;
    limit: number;
  }): Promise<Array<{
    date: string;
    totalActions: number;
    lastActivityAt: Date;
    activities: Array<{
      itemId: string;
      itemQrCode: string;
      itemIdentityCode: string;
      itemType: string;
      actionType: string;
      timestamp: Date;
      location: string;
      remarks?: string;
    }>;
  }>> {
    await connectDB();

    const { userId, startDate, endDate, limit } = params;

    let query: any = { userId };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const activityLogs = await UserActivityLog.find(query)
      .populate('userId', 'name email')
      .populate('activities.itemId', 'qrCode identityCode itemType')
      .sort({ date: -1 })
      .limit(limit);

    return activityLogs.map((log) => ({
      date: log.date,
      totalActions: log.totalActions,
      lastActivityAt: log.lastActivityAt,
      activities: log.activities.map((activity: any) => ({
        itemId: activity.itemId._id.toString(),
        itemQrCode: (activity.itemId as any).qrCode,
        itemIdentityCode: (activity.itemId as any).identityCode,
        itemType: (activity.itemId as any).itemType,
        actionType: activity.actionType,
        timestamp: activity.timestamp,
        location: activity.location,
        remarks: activity.remarks,
      })),
    }));
  }
}
