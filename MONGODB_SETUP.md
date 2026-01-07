# MongoDB Atlas Setup Guide

## Getting Your MongoDB Atlas Connection String

### Step 1: Log in to MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Log in to your account

### Step 2: Get Your Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** as the driver
4. Copy the connection string

It will look like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 3: Update the Connection String

Replace `<username>` and `<password>` with your database user credentials, and add the database name:

```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/bpoinventory?retryWrites=true&w=majority
```

**Important**: Make sure to include `/bpoinventory` at the end (before the `?`) to specify your database name.

### Step 4: Create .env.local File

Create a file named `.env.local` in the project root with:

```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/bpoinventory?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters-long-change-this
NODE_ENV=development
```

### Step 5: Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. For development, you can click **"Add Current IP Address"**
4. Or add `0.0.0.0/0` to allow all IPs (not recommended for production)

### Step 6: Verify Database User

1. Go to **Database Access** in MongoDB Atlas
2. Make sure you have a database user created
3. Note the username and password (you'll need these for the connection string)

## Troubleshooting

### "Authentication failed"

- Check your username and password in the connection string
- Verify the database user exists in MongoDB Atlas
- Make sure the password doesn't contain special characters that need URL encoding

### "IP not whitelisted"

- Add your IP address in Network Access
- Wait a few minutes for changes to propagate

### "Connection timeout"

- Check your internet connection
- Verify the cluster is running (not paused)
- Check firewall settings

### "Database name not found"

- Make sure `/bpoinventory` is included in the connection string
- The database will be created automatically on first connection

## Example .env.local File

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://admin:MySecurePassword123@cluster0.abc123.mongodb.net/bpoinventory?retryWrites=true&w=majority

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=super-secret-jwt-key-change-this-in-production-min-32-chars

# Environment
NODE_ENV=development

# Optional: Custom admin setup credentials
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin User
```

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Use strong passwords for database users
- Rotate JWT_SECRET regularly in production
- Use environment-specific connection strings (dev/staging/prod)

---

Once your `.env.local` is set up, run `npm run setup-admin` to create your admin account!

