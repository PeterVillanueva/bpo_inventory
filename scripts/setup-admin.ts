/**
 * Setup Script: Create First Admin User
 * 
 * This script creates the first admin user without requiring authentication.
 * Run this once to set up your initial admin account.
 * 
 * Usage:
 *   npx tsx scripts/setup-admin.ts
 *   OR
 *   npm run setup-admin
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../models/User';
import { hashPassword } from '../lib/auth';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bpoinventory';

if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables!');
  console.error('\nPlease create a .env.local file with your MongoDB connection string:');
  console.error('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bpoinventory');
  console.error('\nOr for local MongoDB:');
  console.error('MONGODB_URI=mongodb://localhost:27017/bpoinventory\n');
  process.exit(1);
}

async function setupAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\nIf you want to create another admin, use the registration API after logging in.\n');
      process.exit(0);
    }

    // Default admin credentials (change these!)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists!`);
      console.log('   Please use a different email or delete the existing user.\n');
      process.exit(1);
    }

    console.log('📝 Creating admin user...');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: ADMIN\n`);

    const hashedPassword = await hashPassword(adminPassword);

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN',
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}\n`);
    console.log('🔐 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}\n`);
    console.log('⚠️  IMPORTANT: Change the default password after first login!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
setupAdmin();

