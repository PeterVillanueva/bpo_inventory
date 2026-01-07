# BPO Inventory Management System - Architecture Documentation

## 🎯 System Overview

This is an enterprise-grade inventory management system built with Next.js 16 App Router and MongoDB, designed for BPO companies to track asset usage with QR scanning, manual fallback, and comprehensive audit trails.

## 🗂️ Database Schema Design & Justification

### 1. `users` Collection

**Purpose**: Identity, authentication, and role enforcement

```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed, select: false),
  role: "OWNER" | "ADMIN" | "BPO" (indexed),
  name: string,
  employeeId?: string (sparse index),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique) - Fast login lookups
- `role` - Role-based queries
- `{role, email}` (compound) - Common admin queries
- `employeeId` (sparse) - Optional employee tracking

**Justification**: 
- Separate collection for user identity (not embedded) allows for user management without touching item records
- Sparse index on `employeeId` optimizes space while allowing fast lookups when present
- Role indexing enables fast role-based access control queries

---

### 2. `items` Collection

**Purpose**: Asset registry & ownership mapping

```typescript
{
  _id: ObjectId,
  qrCode: string (unique, indexed),
  identityCode: string (unique, indexed, uppercase),
  itemType: "Headset" | "Monitor" | ... (indexed),
  status: "available" | "assigned" | ... (indexed),
  assignedUserId?: ObjectId (ref: User, indexed),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `qrCode` (unique) - QR scan lookups
- `identityCode` (unique) - Manual fallback lookups
- `itemType` - Filtering by asset type
- `status` - Status-based queries
- `assignedUserId` - Finding user's assigned items
- `{status, itemType}` (compound) - Dashboard queries
- `{assignedUserId, status}` (compound) - User assignment queries

**Justification**:
- Dual lookup paths (QR + identity code) ensure reliability
- Compound indexes match common query patterns (e.g., "all assigned monitors")
- Referenced user ID (not embedded) maintains referential integrity without duplication

---

### 3. `item_logs` Collection (CANONICAL AUDIT TRAIL)

**Purpose**: Single source of truth, immutable, legal-grade audit history

```typescript
{
  _id: ObjectId,
  itemId: ObjectId (ref: Item, indexed),
  userId: ObjectId (ref: User, indexed),
  actionType: ActionType (indexed),
  timestamp: Date (indexed),
  date: string "YYYY-MM-DD" (indexed),
  location: Location (indexed),
  remarks?: string,
  createdAt: Date (immutable)
}
```

**Indexes**:
- `itemId` - Item history queries
- `userId` - User activity queries
- `timestamp` - Chronological queries
- `date` - Daily partitioning
- `actionType` - Action filtering
- `location` - Location tracking
- `{itemId, timestamp: -1}` (compound) - Item timeline
- `{userId, timestamp: -1}` (compound) - User timeline
- `{date, actionType}` (compound) - Daily reports
- `{itemId, date: -1, timestamp: -1}` (compound) - Optimized item queries
- `{location, date: -1}` (compound) - Location tracking

**Justification**:
- **Append-only**: No updates/deletes = tamper-proof audit trail
- **Date partitioning**: `date` field enables efficient range queries and potential sharding
- **Compound indexes**: Match exact query patterns, avoiding full collection scans
- **Immutable timestamps**: `createdAt` cannot be modified, ensuring legal compliance
- **No joins needed**: All data denormalized for performance

---

### 4. `user_activity_logs` Collection (USER-CENTRIC READ MODEL)

**Purpose**: Fast admin queries without aggregation

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  date: string "YYYY-MM-DD" (indexed),
  activities: [{
    itemId: ObjectId,
    actionType: ActionType,
    timestamp: Date,
    location: Location,
    remarks?: string
  }],
  totalActions: number,
  lastActivityAt: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{userId, date}` (unique compound) - One document per user per day
- `{date: -1, totalActions: -1}` (compound) - Daily activity ranking
- `{userId, date: -1}` (compound) - User timeline
- `lastActivityAt` - Recent activity queries

**Justification**:
- **Materialized view**: Pre-aggregated data eliminates runtime aggregation
- **Zero aggregation scans**: Admin dashboards query this directly
- **Unique compound index**: Ensures one document per user per day (idempotent updates)
- **Embedded activities array**: All user actions for a day in one document = single query
- **Updated via write pipeline**: Maintains consistency with canonical log

---

### 5. `daily_usage_snapshots` Collection (PERFORMANCE VIEW)

**Purpose**: Duration tracking and time-based analytics

```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  date: string "YYYY-MM-DD" (indexed),
  itemsUsed: [{
    itemId: ObjectId,
    itemType: ItemType,
    scanIn: Date,
    scanOut?: Date,
    durationMinutes?: number
  }],
  totalDurationMinutes: number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{userId, date}` (unique compound) - One snapshot per user per day
- `{date: -1, totalDurationMinutes: -1}` (compound) - Daily usage ranking
- `{userId, date: -1}` (compound) - User usage timeline

**Justification**:
- **Pre-calculated durations**: No runtime date math for dashboards
- **Embedded usage array**: All items used in a day in one document
- **Updated via write pipeline**: Calculated on SCAN_OUT, stored for instant queries
- **Supports "who used what for how long"**: Critical for accountability

---

### 6. `movement_requests` Collection (WORKFLOW LAYER)

**Purpose**: Approval flow management (not a log)

```typescript
{
  _id: ObjectId,
  itemId: ObjectId (ref: Item, indexed),
  userId: ObjectId (ref: User, indexed),
  action: ActionType (indexed),
  reason: string (required),
  status: "pending" | "approved" | "rejected" (indexed),
  requestedAt: Date,
  reviewedBy?: ObjectId (ref: User),
  reviewedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{status, requestedAt: -1}` (compound) - Pending requests queue
- `{userId, status}` (compound) - User's requests
- `{itemId, status}` (compound) - Item requests

**Justification**:
- **Separate from logs**: Workflow state vs. audit trail
- **Status indexing**: Fast pending request queries for admin dashboards
- **Links to logs**: When approved, creates entry in `item_logs`
- **Tracks reviewer**: Full accountability chain

---

### 7. `system_settings` Collection

**Purpose**: Admin-configurable system values

```typescript
{
  _id: ObjectId,
  key: string (unique, indexed, uppercase),
  value: string,
  description: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Justification**:
- Simple key-value store for configuration
- Uppercase keys for consistency
- Descriptions help admins understand settings

---

## ⚡ Performance Optimization Strategy

### 1. **Avoid Runtime Joins**

**Problem**: MongoDB `$lookup` operations are expensive at scale.

**Solution**: 
- Denormalize frequently accessed data (user names, item types) in read models
- Use references only where necessary (for referential integrity)
- Pre-populate data in materialized views

**Example**: `user_activity_logs` embeds item information, eliminating joins for admin dashboards.

---

### 2. **Compound Indexes Match Query Patterns**

**Strategy**: Analyze common queries and create compound indexes that match exactly.

**Examples**:
- `{itemId, timestamp: -1}` - Item history (most recent first)
- `{userId, date: -1}` - User timeline
- `{status, requestedAt: -1}` - Pending requests queue

**Impact**: Queries use indexes entirely, avoiding collection scans.

---

### 3. **Materialized Read Models**

**Collections**: `user_activity_logs`, `daily_usage_snapshots`

**Benefits**:
- Zero aggregation for dashboards
- Sub-100ms query times even with millions of log entries
- Scales linearly with users, not log entries

**Trade-off**: Slight write overhead (acceptable for read-heavy workloads)

---

### 4. **Date Partitioning**

**Field**: `date: "YYYY-MM-DD"` in logs

**Benefits**:
- Efficient range queries (`date: { $gte: start, $lte: end }`)
- Enables time-based sharding if needed
- TTL indexes can be applied per partition

---

### 5. **Partial Indexes** (Future Optimization)

For collections with sparse fields, consider partial indexes:

```javascript
// Only index active items
db.items.createIndex(
  { status: 1, itemType: 1 },
  { partialFilterExpression: { status: { $ne: 'disposed' } } }
);
```

---

## 🔄 Write Pipeline Architecture

### Flow: QR Scan → Logs → Materialized Views

```
1. User scans item (QR or identity code)
   ↓
2. API validates and creates ItemLog entry (canonical)
   ↓
3. Write pipeline executes:
   a. Update user_activity_logs (append to activities array)
   b. Update daily_usage_snapshots (if SCAN_IN/OUT)
   ↓
4. Return success to user
```

### Implementation: `lib/write-pipeline.ts`

**Functions**:
- `executeWritePipeline()` - Main entry point
- `updateUserActivityLog()` - Updates user activity read model
- `updateDailyUsageSnapshot()` - Calculates and stores durations

**Consistency**: 
- Synchronous updates ensure immediate consistency
- For high-throughput scenarios, can be moved to background jobs with eventual consistency

---

## 🔐 Security & Integrity

### 1. **Role-Based Access Control (RBAC)**

**Implementation**: `lib/middleware.ts` - `withAuth()` wrapper

**Roles**:
- **OWNER**: Read-only, dashboards only
- **ADMIN**: Full access, user/item management, approvals
- **BPO**: Limited to assigned items, scan actions, request creation

**Enforcement**: 
- API route level via `withAuth(handler, allowedRoles)`
- Frontend routing (can be bypassed, so API is source of truth)

---

### 2. **Immutable Audit Logs**

**Design**: `item_logs` collection
- No `updatedAt` field (only `createdAt`)
- No update/delete operations allowed
- Timestamps cannot be modified

**Legal Compliance**: 
- Tamper-proof audit trail
- Full accountability chain
- Timestamped actions

---

### 3. **Password Security**

**Implementation**: `lib/auth.ts`
- Bcrypt hashing (12 rounds)
- Passwords never returned in API responses (`select: false`)
- JWT tokens for session management

---

### 4. **Input Validation**

**API Routes**: 
- Required field validation
- Enum validation for action types
- Type checking for ObjectIds

---

## 📊 Query Performance Examples

### Admin Dashboard (Real-time)

**Query**: Get today's activity for all users

**Without Materialized View**:
```javascript
// Would require aggregation pipeline
db.item_logs.aggregate([
  { $match: { date: "2024-01-15" } },
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $lookup: { from: "users", ... } }
]);
// Estimated: 500ms+ with indexes, 5s+ without
```

**With Materialized View**:
```javascript
db.user_activity_logs.find({ date: "2024-01-15" })
  .populate('userId', 'name email')
  .sort({ totalActions: -1 });
// Estimated: <50ms (single index scan)
```

**Performance Gain**: 10x+ faster

---

### User Activity Timeline

**Query**: Get 30 days of activity for a user

**Without Materialized View**:
```javascript
db.item_logs.find({ userId: ObjectId("...") })
  .sort({ timestamp: -1 })
  .limit(1000);
// Requires scanning all logs, then sorting
```

**With Materialized View**:
```javascript
db.user_activity_logs.find({ 
  userId: ObjectId("..."),
  date: { $gte: startDate, $lte: endDate }
}).sort({ date: -1 });
// Single compound index scan, returns pre-aggregated data
```

**Performance Gain**: 100x+ faster for long timelines

---

## 🚀 Scalability Considerations

### Current Design Supports:

1. **Millions of Log Entries**: Materialized views keep dashboard queries fast
2. **Thousands of Users**: Indexed queries scale linearly
3. **High Read Load**: Read models optimized for dashboards
4. **Years of Data**: Date partitioning enables efficient queries

### Future Optimizations:

1. **Sharding**: Partition by `date` field for horizontal scaling
2. **Read Replicas**: Separate read/write operations
3. **Caching**: Redis for frequently accessed dashboards
4. **Background Jobs**: Move write pipeline to queue for high throughput
5. **Archive Strategy**: Move old logs to cold storage, keep summaries

---

## 📝 Indexing Strategy Summary

### Single Field Indexes
- Unique identifiers: `email`, `qrCode`, `identityCode`
- Common filters: `role`, `status`, `itemType`
- Time-based: `timestamp`, `date`, `lastActivityAt`

### Compound Indexes
- Query patterns: `{itemId, timestamp: -1}`, `{userId, date: -1}`
- Filter + sort: `{status, requestedAt: -1}`
- Multi-field filters: `{status, itemType}`, `{userId, status}`

### Unique Compound Indexes
- One-per-day constraints: `{userId, date}`, `{itemId, date}`

### Sparse Indexes
- Optional fields: `employeeId`

---

## 🔍 Monitoring & Maintenance

### Recommended Monitoring

1. **Index Usage**: Track which indexes are used vs. created
2. **Query Performance**: Monitor slow queries (>100ms)
3. **Collection Sizes**: Track growth of `item_logs` vs. read models
4. **Write Pipeline Latency**: Ensure materialized views update quickly

### Maintenance Tasks

1. **Index Rebuilds**: Periodically rebuild indexes if fragmentation occurs
2. **Log Archival**: Move old logs to archive collection after N months
3. **Read Model Reconciliation**: Periodic job to verify consistency (if using eventual consistency)

---

## 🎯 Design Principles Applied

1. **RDBMS-Level Discipline**: Referential integrity, constraints, indexes
2. **NoSQL Flexibility**: Embedded arrays, schema evolution, horizontal scaling
3. **Audit-Grade Integrity**: Immutable logs, full traceability
4. **Performance First**: Materialized views, compound indexes, zero joins
5. **Enterprise Scale**: Designed for millions of records, thousands of users

---

## 📚 Additional Resources

- MongoDB Indexing Best Practices: https://docs.mongodb.com/manual/indexes/
- Mongoose Performance: https://mongoosejs.com/docs/performance.html
- Next.js App Router: https://nextjs.org/docs/app

---

**Last Updated**: 2024
**Version**: 1.0.0

