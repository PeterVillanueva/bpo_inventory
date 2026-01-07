# Setting Up Admin Account

There are **three ways** to create your first admin account. Choose the method that works best for you.

## Method 1: Using the Setup Script (Recommended)

This is the easiest and most secure method.

### Step 1: Install tsx (if not already installed)

```bash
npm install -D tsx
```

### Step 2: Set environment variables (optional)

Create or update your `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/bpoinventory
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bpoinventory

# Optional: Custom admin credentials (defaults shown)
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin User
```

### Step 3: Run the setup script

```bash
npm run setup-admin
```

The script will:
- Connect to MongoDB
- Check if an admin already exists
- Create the admin user with your credentials
- Display login information

### Example Output:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📝 Creating admin user...
   Email: admin@company.com
   Name: Admin User
   Role: ADMIN

✅ Admin user created successfully!
   ID: 507f1f77bcf86cd799439011
   Email: admin@company.com
   Name: Admin User
   Role: ADMIN

🔐 Login Credentials:
   Email: admin@company.com
   Password: Admin123!

⚠️  IMPORTANT: Change the default password after first login!
```

---

## Method 2: Using the Setup API Endpoint

This method uses a one-time API endpoint that doesn't require authentication.

### Step 1: Start the development server

```bash
npm run dev
```

### Step 2: Create admin via API

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

**Using PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/setup/create-admin" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@company.com","password":"Admin123!","name":"Admin User"}'
```

**Using a REST client (Postman, Insomnia, etc.):**
- URL: `POST http://localhost:3000/api/setup/create-admin`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "email": "admin@company.com",
    "password": "Admin123!",
    "name": "Admin User"
  }
  ```

### Step 3: Disable the endpoint (IMPORTANT!)

After creating your admin, **delete the file** `app/api/setup/create-admin/route.ts` to prevent unauthorized admin creation.

---

## Method 3: Direct MongoDB Insert (Advanced)

If you prefer to use MongoDB directly:

### Step 1: Connect to MongoDB

```bash
mongosh bpoinventory
# OR for MongoDB Atlas:
# mongosh "mongodb+srv://username:password@cluster.mongodb.net/bpoinventory"
```

### Step 2: Hash the password

You'll need to hash the password first. You can use Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Admin123!', 12);
console.log(hash);
```

Or use an online bcrypt tool (not recommended for production passwords).

### Step 3: Insert admin user

```javascript
use bpoinventory

db.users.insertOne({
  email: "admin@company.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYq5q5q5q5q", // Replace with actual hash
  name: "Admin User",
  role: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## After Setup

1. **Login** at `http://localhost:3000/login` with your admin credentials
2. **Change your password** (recommended)
3. **Create additional users** via Admin Dashboard → Users
4. **Create items** via Admin Dashboard → Items
5. **Assign items** to users

---

## Troubleshooting

### "Admin user already exists"

If you see this error, an admin account already exists. You can:
- Login with existing admin credentials
- Or delete the existing admin from MongoDB and try again

### "MongoNetworkError: connect ECONNREFUSED"

- Ensure MongoDB is running (`mongod` for local)
- Check your `MONGODB_URI` in `.env.local`
- For Atlas, verify your connection string and IP whitelist

### "Password must be at least 8 characters"

The API endpoint enforces a minimum password length. Use a password with at least 8 characters.

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change default password**: Always change the default password after first login
2. **Disable setup endpoint**: After using Method 2, delete `app/api/setup/create-admin/route.ts`
3. **Use strong passwords**: Minimum 8 characters, include numbers and special characters
4. **Protect .env.local**: Never commit `.env.local` to version control
5. **Production**: In production, remove or heavily restrict the setup endpoint

---

**Need help?** Check the [README.md](./README.md) or [QUICKSTART.md](./QUICKSTART.md) for more information.

