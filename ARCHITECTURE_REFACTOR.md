# Architecture Refactoring Documentation

## Overview

This document describes the MERN-style architecture refactoring applied to the BPO Inventory Management System. The refactoring introduces clean separation of concerns, standardized API consumption, and improved maintainability.

## Architecture Flow

```
Client (React Components)
   ↓
Axios API Client (lib/api-client.ts)
   ↓
Next.js API Route (app/api/**/route.ts)
   ↓
Controller (app/api/**/controller.ts)
   ↓
Service (lib/services/**.service.ts)
   ↓
Mongoose Model (models/**.ts)
```

## Directory Structure

### API Routes (`app/api/`)
Thin HTTP layer that handles routing and authentication middleware only.

**Example: `app/api/items/route.ts`**
```typescript
import { withAuth } from '@/lib/middleware';
import { getItems, createItem } from './controller';

export const GET = withAuth(getItems);
export const POST = withAuth(createItem, ['ADMIN']);
```

### Controllers (`app/api/**/controller.ts`)
Handle HTTP request/response logic, input validation, and delegate to services.

**Example: `app/api/items/controller.ts`**
```typescript
export async function getItems(req: AuthenticatedRequest) {
  try {
    const user = req.user!;
    const { searchParams } = new URL(req.url);
    // Extract query params, validate input
    const items = await itemService.getItems({ user, ...params });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    // Handle errors
  }
}
```

### Services (`lib/services/**.service.ts`)
Contain business logic, database operations, and data transformation.

**Example: `lib/services/item.service.ts`**
```typescript
export class ItemService {
  async getItems(params: GetItemsParams): Promise<ItemDTO[]> {
    await connectDB();
    // Business logic, database queries
    const items = await Item.find(query).populate(...);
    return items.map(transformToDTO);
  }
}
```

### API Client (`lib/api-client.ts`)
Centralized Axios instance with:
- Automatic auth token injection
- Global error handling
- Base URL configuration
- Response interceptors

**Usage in Components:**
```typescript
import apiClient, { extractApiData } from '@/lib/api-client';

// GET request
const response = await apiClient.get('/api/items');
const data = extractApiData(response);

// POST request
await apiClient.post('/api/items', formData);
```

## Key Changes

### 1. API Routes → Thin Wrappers
**Before:**
- Business logic mixed with routing
- Database queries in route handlers
- Hard to test and maintain

**After:**
- Routes only handle HTTP concerns
- Delegates to controllers
- Clean and testable

### 2. Controller Layer
**Purpose:**
- Extract request parameters
- Validate input
- Handle HTTP responses
- Delegate business logic to services

**Benefits:**
- Clear separation of HTTP and business logic
- Reusable across different HTTP contexts
- Easier to test

### 3. Service Layer
**Purpose:**
- Business logic implementation
- Database operations
- Data transformation (DTOs)
- Reusable across controllers

**Benefits:**
- Testable business logic
- Reusable across endpoints
- Clear data contracts

### 4. Axios Standardization
**Before:**
- Mixed use of native `fetch`
- Manual token handling in each component
- Inconsistent error handling

**After:**
- Single Axios instance
- Automatic token injection
- Centralized error handling
- Type-safe responses

## Migration Guide

### Updating Components to Use Axios

**Before:**
```typescript
const token = localStorage.getItem('token');
const response = await fetch('/api/items', {
  headers: {
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  credentials: 'include',
});
const data = await response.json();
```

**After:**
```typescript
import apiClient, { extractApiData } from '@/lib/api-client';

const response = await apiClient.get('/api/items');
const data = extractApiData(response);
```

### Error Handling

**Before:**
```typescript
if (!response.ok) {
  alert(data.error || 'Failed');
  return;
}
```

**After:**
```typescript
try {
  await apiClient.post('/api/items', formData);
} catch (error: any) {
  alert(error.response?.data?.error || error.message || 'Failed');
}
```

## File Organization

```
app/
 └── api/
     ├── items/
     │   ├── route.ts        ← HTTP routing only
     │   └── controller.ts   ← Request handling
     ├── users/
     │   ├── route.ts
     │   └── controller.ts
     ├── auth/
     │   ├── login/
     │   │   ├── route.ts
     │   │   └── controller.ts
     │   └── register/
     │       ├── route.ts
     │       └── controller.ts
     ├── movement-requests/
     │   ├── route.ts
     │   ├── controller.ts
     │   └── [id]/
     │       └── review/
     │           ├── route.ts
     │           └── controller.ts
     └── analytics/
         ├── dashboard/
         │   ├── route.ts
         │   └── controller.ts
         ├── item-history/
         │   └── [itemId]/
         │       ├── route.ts
         │       └── controller.ts
         └── user-activity/
             └── [userId]/
                 ├── route.ts
                 └── controller.ts

lib/
 ├── api-client.ts          ← Centralized Axios client
 └── services/
     ├── item.service.ts
     ├── user.service.ts
     ├── auth.service.ts
     ├── movement-request.service.ts
     └── analytics.service.ts
```

## Benefits

1. **Maintainability**: Clear separation of concerns makes code easier to understand and modify
2. **Testability**: Business logic in services can be unit tested independently
3. **Reusability**: Services can be reused across different endpoints
4. **Consistency**: Standardized API consumption patterns
5. **Scalability**: Easy to add new endpoints following the same pattern
6. **Type Safety**: Better TypeScript support with typed responses

## Next Steps

1. **Update Remaining Components**: Migrate all frontend components to use Axios
   - `app/dashboard/bpo/**/*.tsx`
   - `app/dashboard/admin/requests/page.tsx`
   - `app/dashboard/admin/activity/page.tsx`
   - `app/dashboard/owner/**/*.tsx`

2. **Add Request/Response Types**: Create TypeScript interfaces for all API requests/responses

3. **Add Unit Tests**: Write tests for services and controllers

4. **Add API Documentation**: Document all endpoints with their request/response formats

## Notes

- All existing API contracts are preserved - no breaking changes
- Authentication middleware (`withAuth`) remains unchanged
- Database schemas are unchanged
- UI components remain unchanged (only API consumption updated)
