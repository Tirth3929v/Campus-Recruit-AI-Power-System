const mongoose = require('mongoose');

const connectDB = async () => {
  const localUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_recruit';
  console.log(`🔗 Attempting MongoDB connection to: ${localUri}`);
  
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000, // Faster failure for local
        socketTimeoutMS: 45000,
        family: 4,  // IPv4 only
        maxPoolSize: 10
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 MongoDB ready - campus_recruit DB`);
      return conn;
    } catch (error) {
      retries--;
      console.error(`❌ Attempt ${5-retries} failed: ${error.message}`);
      if (retries === 0) throw error;
      console.log(`🔄 Retrying in 1s... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

module.exports = connectDB;

