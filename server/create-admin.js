const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit_v2');
    
    const adminData = {
      name: 'Admin',
      email: 'admin@campusrecruit.com',
      password: 'admin123',
      role: 'admin',
      isSuperAdmin: true,
      isVerified: true
    };
    
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Password: admin123');
    } else {
      const admin = await Admin.create(adminData);
      console.log('Admin created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
