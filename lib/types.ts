export type UserRole = 'OWNER' | 'ADMIN' | 'BPO';

export type ItemType = 'Headset' | 'Monitor' | 'Keyboard' | 'Mouse' | 'System Unit' | 'AVR' | 'UPS';

export type ItemStatus = 'available' | 'assigned' | 'repair' | 'disposed' | 'borrowed';

export type ActionType = 
  | 'SCAN_IN' 
  | 'SCAN_OUT' 
  | 'REQUEST_REPAIR' 
  | 'REQUEST_DISPOSE' 
  | 'REQUEST_BORROW' 
  | 'REQUEST_TRANSFER_FLOOR_1' 
  | 'REQUEST_TRANSFER_FLOOR_2' 
  | 'REQUEST_TRANSFER_FLOOR_3'
  | 'APPROVED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'UNASSIGNED';

export type MovementRequestStatus = 'pending' | 'approved' | 'rejected';

export type Location = 'Floor 1' | 'Floor 2' | 'Floor 3' | 'Repair' | 'Storage' | 'Disposed';

export interface User {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  _id: string;
  qrCode: string;
  itemType: ItemType;
  status: ItemStatus;
  assignedUserId?: string;
  identityCode: string; // Manual fallback code
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemLog {
  _id: string;
  itemId: string;
  userId: string;
  actionType: ActionType;
  timestamp: Date;
  date: string; // YYYY-MM-DD format for partitioning
  location: Location;
  remarks?: string;
  createdAt: Date;
}

export interface UserActivityLog {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  activities: Array<{
    itemId: string;
    actionType: ActionType;
    timestamp: Date;
    location: Location;
    remarks?: string;
  }>;
  totalActions: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyUsageSnapshot {
  _id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  itemsUsed: Array<{
    itemId: string;
    itemType: ItemType;
    scanIn: Date;
    scanOut?: Date;
    durationMinutes?: number;
  }>;
  totalDurationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovementRequest {
  _id: string;
  itemId: string;
  userId: string;
  action: ActionType;
  reason: string; // Required remarks
  status: MovementRequestStatus;
  requestedAt: Date;
  reviewedBy?: string; // Admin user ID
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSetting {
  _id: string;
  key: string;
  value: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

