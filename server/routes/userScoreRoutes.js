const express = require('express');
const router = express.Router();
const userScoreController = require('../controllers/userScoreController');
const jwt = require('jsonwebtoken');

// Token verification middleware
const verifyToken = (req, res, next) => {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Returns merged scorecard data (Course + Interview) for a specific user ID
router.get('/:userId/scorecard', verifyToken, userScoreController.getUserScorecard);

module.exports = router;
