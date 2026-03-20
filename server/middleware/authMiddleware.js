const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log('🧑 TOKEN DECODED:', token.substring(0, 20) + '...');

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');

      console.log('🔓 JWT Payload:', JSON.stringify(decoded));

      req.user = await User.findById(decoded.id).select('-password');

      console.log('✅ req.user:', req.user?.email, 'role:', req.user?.role);

      next();
    } catch (error) {
      console.error('❌ Auth Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  console.log('🔐 Checking admin:', req.user?.role);

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

module.exports = { protect, adminOnly };