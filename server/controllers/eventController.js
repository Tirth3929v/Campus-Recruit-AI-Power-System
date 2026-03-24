const Event = require('../models/Event');
const User  = require('../models/User');
const { transporter } = require('../utils/email');

// ── GET /api/events ───────────────────────────────────────────
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/events ──────────────────────────────────────────
exports.createAndBroadcastEvent = async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const event = await Event.create({
      title, description, date, type: type || 'Event',
      createdBy: req.user.id,
    });

    // Fetch all verified student emails
    const students = await User.find({ role: 'student', isVerified: true }).select('email name');

    if (students.length > 0) {
      const typeColors = { Course: '#14b8a6', Event: '#3b82f6', Notice: '#f59e0b' };
      const color = typeColors[type] || '#3b82f6';
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      const emailList = students.map(s => s.email);

      /*
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        bcc: emailList,                          // BCC keeps addresses private
        subject: `📢 New ${type || 'Event'}: ${title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:10px;">
            <div style="background:linear-gradient(135deg,${color},#1e293b);padding:24px;border-radius:8px;margin-bottom:20px;">
              <span style="background:rgba(255,255,255,0.2);color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold;text-transform:uppercase;">${type || 'Event'}</span>
              <h1 style="color:#fff;margin:12px 0 0;font-size:22px;">${title}</h1>
            </div>
            <p style="color:#374151;font-size:15px;line-height:1.6;">${description || 'No additional details provided.'}</p>
            <div style="background:#f9fafb;padding:14px;border-left:4px solid ${color};border-radius:4px;margin:20px 0;">
              <p style="margin:0;color:#6b7280;font-size:13px;">📅 <strong>Date:</strong> ${formattedDate}</p>
            </div>
            <p style="color:#9ca3af;font-size:12px;margin-top:30px;">Campus Recruiting Team</p>
          </div>
        `,
      });
      console.log(`✉️ Event broadcast sent to ${emailList.length} students`);
      */
    }

    res.status(201).json({ success: true, event, emailsSent: students.length });
  } catch (err) {
    console.error('createAndBroadcastEvent error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
