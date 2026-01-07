# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB (if installed locally)
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string

### Step 3: Configure Environment

Create `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/bpo_inventory
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bpo_inventory

JWT_SECRET=your-secret-key-minimum-32-characters-long
NODE_ENV=development
```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Create First Admin User

**Option A: Using Setup Script (Recommended)**

```bash
# Install tsx if needed
npm install -D tsx

# Run setup script
npm run setup-admin
```

This will create an admin with default credentials:
- Email: `admin@company.com`
- Password: `Admin123!`
- Name: `Admin User`

You can customize these by setting environment variables in `.env.local`:
```env
ADMIN_EMAIL=your-email@company.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Your Name
```

**Option B: Using Setup API Endpoint**

```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

**⚠️ Important**: After using this method, delete `app/api/setup/create-admin/route.ts` for security.

**Option C: Direct MongoDB**

See [SETUP_ADMIN.md](./SETUP_ADMIN.md) for detailed MongoDB instructions.

For more details, see [SETUP_ADMIN.md](./SETUP_ADMIN.md).

### Step 6: Login

1. Navigate to `/login`
2. Use credentials:
   - Email: `admin@company.com`
   - Password: `Admin123!` (or your chosen password)

### Step 7: Create Test Data

1. **Register a BPO User**
   - Go to Admin Dashboard → Users
   - Click "Add User"
   - Fill in details, select role "BPO User"

2. **Create an Item**
   - Go to Admin Dashboard → Items
   - Click "Add Item"
   - Enter:
     - QR Code: `QR-001`
     - Identity Code: `MON-001`
     - Item Type: `Monitor`
     - Status: `available`

3. **Assign Item to User**
   - Go to Items page
   - Find the item
   - Assign to the BPO user

4. **Test Scanning (as BPO User)**
   - Logout and login as BPO user
   - Go to "Scan" page
   - Enter QR code or identity code
   - Select action (Scan In/Out)
   - Select location
   - Submit

## 📋 Common Tasks

### Create QR Codes for Items

You can use any QR code generator. The QR code should contain a unique identifier (e.g., `QR-001`, `QR-002`).

**Online Tools:**
- https://www.qr-code-generator.com/
- https://qr-code-generator.com/

**Programmatic (Node.js):**
```javascript
const QRCode = require('qrcode');
await QRCode.toFile('item-qr-001.png', 'QR-001');
```

### Bulk Import Items

Create a script or use MongoDB directly:

```javascript
const items = [
  { qrCode: 'QR-001', identityCode: 'MON-001', itemType: 'Monitor', status: 'available' },
  { qrCode: 'QR-002', identityCode: 'KEY-001', itemType: 'Keyboard', status: 'available' },
  // ... more items
];

db.items.insertMany(items.map(item => ({
  ...item,
  createdAt: new Date(),
  updatedAt: new Date()
})));
```

### View Audit Logs

All item movements are logged in `item_logs` collection:

```javascript
// View all logs
db.item_logs.find().sort({ timestamp: -1 }).limit(100);

// View logs for specific item
db.item_logs.find({ itemId: ObjectId("...") }).sort({ timestamp: -1 });

// View logs for specific user
db.item_logs.find({ userId: ObjectId("...") }).sort({ timestamp: -1 });
```

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
- Ensure MongoDB is running (`mongod` for local)
- Check `MONGODB_URI` in `.env.local`
- For Atlas, whitelist your IP address

### Authentication Errors

**Error**: `Unauthorized` or `Invalid token`

**Solution**:
- Clear browser cookies
- Login again
- Check `JWT_SECRET` is set in `.env.local`

### TypeScript Errors

**Error**: Type errors in IDE

**Solution**:
```bash
npm install
# Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
```

### Build Errors

**Error**: Build fails

**Solution**:
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## 📚 Next Steps

1. **Read Architecture Docs**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design
2. **Customize**: Modify item types, actions, or roles as needed
3. **Deploy**: Follow deployment guide in [README.md](./README.md)
4. **Monitor**: Set up monitoring for production (see ARCHITECTURE.md)

## 🆘 Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Review [README.md](./README.md) for full documentation
- Check API routes in `app/api/` for endpoint details

---

**Happy Tracking! 🎯**

