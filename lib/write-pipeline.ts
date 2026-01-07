import ItemLog from '@/models/ItemLog';
import UserActivityLog from '@/models/UserActivityLog';
import DailyUsageSnapshot from '@/models/DailyUsageSnapshot';
import { ActionType, Location } from './types';

/**
 * WRITE PIPELINE
 * 
 * Purpose: Update materialized views after each log entry
 * - Ensures consistency between canonical log and read models
 * - Runs synchronously for immediate consistency
 * - Can be moved to background jobs for high-throughput scenarios
 */

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Update user activity log after an item log entry
 */
export async function updateUserActivityLog(
  userId: string,
  itemId: string,
  actionType: ActionType,
  location: Location,
  remarks?: string
): Promise<void> {
  const now = new Date();
  const date = formatDate(now);

  await UserActivityLog.findOneAndUpdate(
    { userId, date },
    {
      $push: {
        activities: {
          itemId,
          actionType,
          timestamp: now,
          location,
          remarks,
        },
      },
      $inc: { totalActions: 1 },
      $set: { lastActivityAt: now },
    },
    { upsert: true, new: true }
  );
}

/**
 * Update daily usage snapshot for scan_in/scan_out actions
 */
export async function updateDailyUsageSnapshot(
  userId: string,
  itemId: string,
  itemType: string,
  actionType: ActionType
): Promise<void> {
  const now = new Date();
  const date = formatDate(now);

  if (actionType === 'SCAN_IN') {
    // Add new usage entry
    await DailyUsageSnapshot.findOneAndUpdate(
      { userId, date },
      {
        $push: {
          itemsUsed: {
            itemId,
            itemType,
            scanIn: now,
          },
        },
      },
      { upsert: true, new: true }
    );
  } else if (actionType === 'SCAN_OUT') {
    // Find the most recent scan_in for this item today
    const snapshot = await DailyUsageSnapshot.findOne({
      userId,
      date,
      'itemsUsed.itemId': itemId,
      'itemsUsed.scanOut': { $exists: false },
    });

    if (snapshot) {
      const itemUsage = snapshot.itemsUsed.find(
        (usage: { itemId: { toString: () => string } | string; scanOut?: Date }) => {
          const usageItemId = typeof usage.itemId === 'object' && 'toString' in usage.itemId 
            ? usage.itemId.toString() 
            : String(usage.itemId);
          return usageItemId === itemId.toString() && !usage.scanOut;
        }
      );

      if (itemUsage) {
        const durationMinutes = Math.floor(
          (now.getTime() - itemUsage.scanIn.getTime()) / (1000 * 60)
        );

        await DailyUsageSnapshot.findOneAndUpdate(
          { userId, date, 'itemsUsed.itemId': itemId },
          {
            $set: {
              'itemsUsed.$.scanOut': now,
              'itemsUsed.$.durationMinutes': durationMinutes,
            },
            $inc: { totalDurationMinutes: durationMinutes },
          }
        );
      }
    }
  }
}

/**
 * Main write pipeline: creates log entry and updates all materialized views
 */
export async function executeWritePipeline(
  itemId: string,
  userId: string,
  actionType: ActionType,
  location: Location,
  remarks?: string,
  itemType?: string
): Promise<void> {
  const now = new Date();
  const date = formatDate(now);

  // 1. Create canonical log entry (immutable)
  await ItemLog.create({
    itemId,
    userId,
    actionType,
    timestamp: now,
    date,
    location,
    remarks,
  });

  // 2. Update user activity log (read model)
  await updateUserActivityLog(userId, itemId, actionType, location, remarks);

  // 3. Update daily usage snapshot if scan action
  if (itemType && (actionType === 'SCAN_IN' || actionType === 'SCAN_OUT')) {
    await updateDailyUsageSnapshot(userId, itemId, itemType, actionType);
  }
}

