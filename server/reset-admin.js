require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const resetAdmin = async () => {
  try {
    console.log('\n🧹 Clearing User collection...');
    await User.deleteMany({});
    console.log('   ✓ All users deleted\n');

    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin@123',
      role: 'admin',
      isVerified: true,
      currentStreak: 0
    });

    console.log('   ✓ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('   Email: admin@gmail.com');
    console.log('   Password: admin@123');
    console.log('\n✅ Database reset complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
