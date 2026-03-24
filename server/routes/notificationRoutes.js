const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyRouteAuth = async (req, res, next) => {
    let token = req.cookies.token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.error('❌ No token provided in notifications auth');
        return res.status(401).json({ error: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'campus_recruit_jwt_secret_2026_secure_key');
        console.log('✅ Token verified for user:', verified.id, 'Role:', verified.role);
        
        // Try to find user in User collection first
        let currentUser = null;
        try {
            currentUser = await User.findById(verified.id).select('role');
            if (currentUser) {
                console.log('✅ User found in User collection');
            }
        } catch (userErr) {
            console.error('❌ Error querying User collection:', userErr.message);
        }
        
        // If not found in User collection, try Employee collection
        if (!currentUser && verified.role === 'employee') {
            try {
                const Employee = require('../models/Employee');
                currentUser = await Employee.findById(verified.id).select('role');
                if (currentUser) {
                    console.log('✅ User found in Employee collection');
                }
            } catch (err) {
                console.log('⚠️ Employee model not found or error:', err.message);
            }
        }
        
        // If not found in User or Employee, try Company collection
        if (!currentUser && verified.role === 'company') {
            try {
                const Company = require('../models/Company');
                currentUser = await Company.findById(verified.id).select('role');
                if (currentUser) {
                    console.log('✅ User found in Company collection');
                }
            } catch (err) {
                console.log('⚠️ Company model not found or error:', err.message);
            }
        }
        
        // Use the role from JWT token as fallback
        const role = currentUser?.role || verified.role || 'student';
        
        req.user = { id: verified.id, role };
        console.log('✅ Auth successful - User ID:', req.user.id, 'Role:', req.user.role);
        next();
    } catch (err) {
        console.error('❌ Auth verification error:', err.message);
        console.error('Stack:', err.stack);
        res.status(400).json({ error: 'Invalid token' });
    }
};

// GET /api/notifications - Get own notifications
router.get('/', verifyRouteAuth, async (req, res) => {
    try {
        // Validate user ID exists
        if (!req.user || !req.user.id) {
            console.error('❌ User not authenticated - req.user:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('✅ Fetching notifications for user:', req.user.id, 'Role:', req.user.role);
        
        // Validate ObjectId format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            console.error('❌ Invalid user ID format:', req.user.id);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const notifications = await Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(); // Use lean() for better performance
        
        console.log(`✅ Found ${notifications.length} notifications for user ${req.user.id}`);
        res.json(notifications);
    } catch (err) {
        console.error('❌ Get notifications error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ 
            message: 'Failed to fetch notifications',
            error: err.message 
        });
    }
});

// PUT /api/notifications/read-all - Mark all as read (MUST come before /:id/read)
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
        // Validate authentication
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized - user not authenticated' });
        }

        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
        }

        const { recipientId, title, message } = req.body;

        // Validate request body
        if (!recipientId || !title || !message) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { recipientId: !!recipientId, title: !!title, message: !!message }
            });
        }

        // Verify recipient exists
        let targetUser;
        try {
            targetUser = await User.findById(recipientId);
        } catch (dbError) {
            console.error('Database query error in send notification:', dbError);
            return res.status(500).json({ 
                message: 'Database error while fetching recipient',
                error: dbError.message 
            });
        }

        if (!targetUser) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Create notification
        let newNotification;
        try {
            newNotification = await Notification.create({
                recipientId,
                title,
                message,
                type: 'manual',
                sentBy: req.user.id
            });
        } catch (createError) {
            console.error('Notification creation error:', createError);
            return res.status(500).json({ 
                message: 'Failed to create notification',
                error: createError.message 
            });
        }

        // Emit via socket if the user is online (non-critical)
        try {
            const io = req.app.get('socketio');
            if (io) {
                io.to(recipientId.toString()).emit('new_notification', newNotification);
            }
        } catch (socketError) {
            console.error('Socket emit error (non-critical):', socketError);
            // Don't fail the request if socket fails
        }

        res.status(201).json({ success: true, notification: newNotification });
    } catch (err) {
        console.error('\n=== 🔥 SEND NOTIFICATION ERROR ===');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        console.error('Stack Trace:', err.stack);
        console.error('=== END ERROR REPORT ===\n');
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to send notification',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// POST /api/notifications/broadcast - Send a notification to ALL users of a specific role
router.post('/broadcast', verifyRouteAuth, async (req, res) => {
    try {
        // Validate authentication
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized - user not authenticated' });
        }

        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden - insufficient permissions' });
        }

        const { targetRole, title, message } = req.body;

        // Validate request body
        if (!targetRole || !title || !message) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { targetRole: !!targetRole, title: !!title, message: !!message }
            });
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
        let targetUsers = [];
        try {
            targetUsers = await User.find({ role: targetRole }).select('_id');
        } catch (dbError) {
            console.error('Database query error in broadcast:', dbError);
            return res.status(500).json({ 
                message: 'Database error while fetching users',
                error: dbError.message 
            });
        }

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

        try {
            await Notification.insertMany(notificationsToInsert);
        } catch (insertError) {
            console.error('Notification insert error:', insertError);
            return res.status(500).json({ 
                message: 'Failed to create notifications',
                error: insertError.message 
            });
        }

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
        try {
            const io = req.app.get('socketio');
            if (io) {
                io.to(`role:${targetRole}`).emit('new_notification', sampleNotification);
            }
        } catch (socketError) {
            console.error('Socket emit error (non-critical):', socketError);
            // Don't fail the request if socket fails
        }

        res.status(201).json({
            success: true,
            message: `Successfully broadcasted to ${targetUsers.length} ${targetRole}(s)`
        });
    } catch (err) {
        console.error('\n=== 🔥 BROADCAST NOTIFICATION ERROR ===');
        console.error('Error Type:', err.name);
        console.error('Error Message:', err.message);
        console.error('Stack Trace:', err.stack);
        console.error('=== END ERROR REPORT ===\n');
        
        res.status(500).json({ 
            success: false,
            message: 'Failed to broadcast notification',
            error: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

module.exports = router;
