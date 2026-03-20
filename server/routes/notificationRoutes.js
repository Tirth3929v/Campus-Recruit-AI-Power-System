const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');

// Middleware to verify token inside this route file if needed
const jwt = require('jsonwebtoken');

const verifyRouteAuth = async (req, res, next) => {
    let token = req.cookies.token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        const currentUser = await User.findById(verified.id).select('role');
        req.user = { id: verified.id, role: currentUser?.role };
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// GET /api/notifications - Get own notifications
router.get('/', verifyRouteAuth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50); // Get latest 50
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', verifyRouteAuth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', verifyRouteAuth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'All marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/notifications/users-list - Search users/companies for employee target dropdown
router.get('/users-list', verifyRouteAuth, async (req, res) => {
    try {
        // Only allow employees or admins
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { q, role } = req.query;
        if (!q || q.length < 2) return res.json([]);

        let allowedRoles = [];
        if (req.user.role === 'admin') {
            allowedRoles = ['student', 'company', 'employee'];
        } else if (req.user.role === 'employee') {
            allowedRoles = ['student', 'company'];
        }

        // If query role is explicitly passed and we're allowed to query it
        if (role && allowedRoles.includes(role)) {
            allowedRoles = [role];
        }

        // Search in users directly
        const users = await User.find({
            $and: [
                { role: { $in: allowedRoles } },
                {
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        }).select('name email role _id').limit(15);

        res.json(users);
    } catch (err) {
        console.error('User list search error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notifications/send - Send a manual notification (employee/admin only)
router.post('/send', verifyRouteAuth, async (req, res) => {
    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { recipientId, title, message } = req.body;

        if (!recipientId || !title || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const targetUser = await User.findById(recipientId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const newNotification = await Notification.create({
            recipientId,
            title,
            message,
            type: 'manual',
            sentBy: req.user.id
        });

        // Emit via socket if the user is online
        const io = req.app.get('socketio');
        if (io) {
            io.to(recipientId.toString()).emit('new_notification', newNotification);
        }

        res.status(201).json({ success: true, notification: newNotification });
    } catch (err) {
        console.error('Send notification error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST /api/notifications/broadcast - Send a notification to ALL users of a specific role
router.post('/broadcast', verifyRouteAuth, async (req, res) => {
    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { targetRole, title, message } = req.body;

        if (!targetRole || !title || !message) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let allowedRoles = [];
        if (req.user.role === 'admin') {
            allowedRoles = ['student', 'company', 'employee'];
        } else if (req.user.role === 'employee') {
            allowedRoles = ['student', 'company'];
        }

        if (!allowedRoles.includes(targetRole)) {
            return res.status(403).json({ message: `Cannot broadcast to ${targetRole}` });
        }

        // Find all users with the target role
        const targetUsers = await User.find({ role: targetRole }).select('_id');

        if (targetUsers.length === 0) {
            return res.status(404).json({ message: `No users found with role ${targetRole}` });
        }

        // Bulk insert notifications
        const notificationsToInsert = targetUsers.map(u => ({
            recipientId: u._id,
            title,
            message,
            type: 'manual',
            sentBy: req.user.id
        }));

        await Notification.insertMany(notificationsToInsert);

        // We only need one sample document structure to send via realtime socket
        const sampleNotification = {
            _id: 'broadcast_' + Date.now(),
            title,
            message,
            type: 'manual',
            createdAt: new Date(),
            isRead: false
        };

        // Emit to the specific role room
        const io = req.app.get('socketio');
        if (io) {
            io.to(`role:${targetRole}`).emit('new_notification', sampleNotification);
        }

        res.status(201).json({
            success: true,
            message: `Successfully broadcasted to ${targetUsers.length} ${targetRole}(s)`
        });
    } catch (err) {
        console.error('Broadcast notification error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
