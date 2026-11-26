const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  // A default password in source code would be public on GitHub, so the
  // admin password must come from backend/.env.
  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not set in backend/.env - refusing to create an admin with a default password.');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/GardenGrains1');
    console.log('MongoDB Connected...');

    // Create admin user
    const adminData = {
      name: 'Admin',
      email: 'admin@gardengrains.com',
      password: process.env.ADMIN_PASSWORD, // from backend/.env; hashed automatically
      phone: '1234567890',
      role: 'admin',
      isActive: true,
      // The admin is created from the server, not via the sign-up mail flow,
      // so there is no verification link to click; without this the account
      // can never log in (auth.js rejects unverified emails).
      emailVerified: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      if (!existingAdmin.emailVerified) {
        existingAdmin.emailVerified = true;
        await existingAdmin.save();
        console.log('Marked existing admin as email-verified.');
      }
      console.log('Admin user already exists!');
      console.log('Email:', adminData.email);
      console.log('Password: (ADMIN_PASSWORD from backend/.env)');
      process.exit(0);
      return;
    }

    // Create new admin
    const admin = new User(adminData);
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password: (ADMIN_PASSWORD from backend/.env)');
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

