const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit');
        console.log('Connected to MongoDB');
        
        const adminEmail = 'admin@gmail.com';
        const user = await User.findOne({ email: adminEmail }).select('+password');
        
        if (!user) {
            console.log(`User with email ${adminEmail} not found!`);
        } else {
            console.log(`User found: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`IsVerified: ${user.isVerified}`);
            
            // Check password match manually
            const bcrypt = require('bcryptjs');
            const matchLower = await bcrypt.compare('admin@123', user.password);
            const matchUpper = await bcrypt.compare('Admin@123', user.password);
            
            console.log(`Password 'admin@123' match: ${matchLower}`);
            console.log(`Password 'Admin@123' match: ${matchUpper}`);
        }
        
        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkAdmin();
