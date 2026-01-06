# BPO Inventory Management System

Enterprise-grade inventory management system with QR scanning, manual fallback, and comprehensive audit trails.

## 🚀 Features

- **QR Code Scanning**: Fast item scanning with QR codes
- **Manual Fallback**: Identity code entry when QR unavailable
- **Role-Based Access**: Owner (read-only), Admin (full access), BPO User (assigned items)
- **Audit Trail**: Immutable, legal-grade audit logs
- **Real-Time Dashboards**: Optimized for read-heavy workloads
- **Movement Requests**: Approval workflow for repairs, transfers, disposal
- **User Activity Tracking**: Complete accountability by person
- **Duration Tracking**: Time-based usage analytics

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bpo_inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bpo_inventory
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles

### Owner
- Read-only access
- View dashboards and analytics
- No data mutation

### Admin
- Full system access
- Register users
- Manage items
- Track item movements
- Review and approve requests
- View user activity history

### BPO User
- Log in daily
- Scan assigned items (QR or manual)
- Request repairs, disposal, borrow, transfer
- Provide remarks/reasons for actions

## 📖 Usage Guide

### Initial Setup

1. **Create Admin User** (via MongoDB shell or API)
   ```javascript
   // Use the registration API endpoint
   POST /api/auth/register
   {
     "email": "admin@company.com",
     "password": "securepassword",
     "name": "Admin User",
     "role": "ADMIN"
   }
   ```

2. **Login** at `/login`

3. **Register Users** via Admin dashboard

4. **Create Items** via Admin dashboard (Items page)

5. **Assign Items** to users via Admin dashboard

### BPO User Workflow

1. **Login** → Redirected to BPO dashboard
2. **View Assigned Items** → See all items assigned to you
3. **Scan Item** → Use QR code or identity code
4. **Select Action** → Scan In / Scan Out
5. **Provide Location** → Floor 1/2/3
6. **Add Remarks** (optional)
7. **Submit** → Item logged and tracked

### Admin Workflow

1. **Dashboard** → View overview and recent activity
2. **Items** → Create, view, and manage items
3. **Users** → Register and manage users
4. **Requests** → Review and approve/reject movement requests
5. **Activity** → Track user activity timelines

### Owner Workflow

1. **Dashboard** → View analytics overview
2. **Analytics** → Detailed analytics and reports

## 🗂️ Database Collections

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema documentation.

### Core Collections

1. **users** - User accounts and roles
2. **items** - Asset registry
3. **item_logs** - Canonical audit trail (immutable)
4. **user_activity_logs** - User-centric read model
5. **daily_usage_snapshots** - Duration tracking
6. **movement_requests** - Approval workflow
7. **system_settings** - Configuration

## 🔐 Security

- **Password Hashing**: Bcrypt (12 rounds)
- **JWT Authentication**: HTTP-only cookies
- **Role-Based Access**: Enforced at API level
- **Immutable Logs**: Tamper-proof audit trail
- **Input Validation**: All API endpoints validate input

## ⚡ Performance

- **Materialized Views**: Pre-aggregated data for fast dashboards
- **Compound Indexes**: Optimized for common query patterns
- **Zero Joins**: Denormalized read models
- **Date Partitioning**: Efficient time-based queries

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed performance notes.

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register user (Admin only)

### Items
- `GET /api/items` - List items (filtered by role)
- `POST /api/items` - Create item (Admin only)
- `POST /api/items/scan` - Scan item (Admin/BPO)
- `POST /api/items/[id]/assign` - Assign item (Admin only)

### Movement Requests
- `GET /api/movement-requests` - List requests
- `POST /api/movement-requests` - Create request (Admin/BPO)
- `POST /api/movement-requests/[id]/review` - Review request (Admin only)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard data (Admin/Owner)
- `GET /api/analytics/user-activity/[userId]` - User activity (Admin/Owner)
- `GET /api/analytics/item-history/[itemId]` - Item history (Admin/Owner)

### Users
- `GET /api/users` - List users (Admin/Owner)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Development Notes

### Adding New Item Types

1. Update `ItemType` in `lib/types.ts`
2. Update enum in `models/Item.ts`
3. Update UI dropdowns in admin pages

### Adding New Actions

1. Update `ActionType` in `lib/types.ts`
2. Update enum in `models/ItemLog.ts`
3. Update write pipeline if needed
4. Update UI components

### Database Migrations

For schema changes, create migration scripts in `migrations/` directory.

## 🚀 Deployment

### Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bpo_inventory
JWT_SECRET=production-secret-key-min-32-chars
NODE_ENV=production
```

### Build

```bash
npm run build
npm start
```

### MongoDB Atlas Setup

1. Create cluster on MongoDB Atlas
2. Get connection string
3. Set `MONGODB_URI` in environment variables
4. Whitelist deployment IP addresses

## 📚 Documentation

- [Architecture Documentation](./ARCHITECTURE.md) - Detailed schema design and performance notes
- [API Documentation](./API.md) - Complete API reference (if created)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for BPO inventory management.

## 🆘 Support

For issues and questions, contact the development team.

---

**Built with ❤️ for enterprise inventory management**
