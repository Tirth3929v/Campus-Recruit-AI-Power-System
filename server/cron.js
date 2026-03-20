const cron = require('node-cron');
const Interview = require('./models/Interview');
const nodemailer = require('nodemailer');

const startReminderJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('Running interview reminder job...');
    try {
      const now = new Date();
      // Check for interviews happening roughly 24 hours from now
      // We look for a window between 23 and 25 hours to ensure we catch them during the hourly run
      const startWindow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const endWindow = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      const interviews = await Interview.find({
        date: { $gte: startWindow, $lte: endWindow },
        status: 'Scheduled',
        reminderSent: { $ne: true }
      }).populate('candidate', 'name email').populate('job', 'title company');

      if (interviews.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        for (const interview of interviews) {
          const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: interview.candidate.email,
            subject: `Reminder: Interview for ${interview.job.title} Tomorrow`,
            html: `
              <h2>Interview Reminder</h2>
              <p>Dear ${interview.candidate.name},</p>
              <p>This is a friendly reminder that you have an interview scheduled for the <strong>${interview.job.title}</strong> position at <strong>${interview.job.company}</strong> in approximately 24 hours.</p>
              <p><strong>Date:</strong> ${new Date(interview.date).toLocaleString()}</p>
              <p><strong>Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>
              <p>Please ensure you are ready 5 minutes before the scheduled time.</p>
              <p>Good luck!</p>
              <p>Best regards,<br/>Recruitment Team</p>
            `,
          };

          await transporter.sendMail(mailOptions);
          
          interview.reminderSent = true;
          await interview.save();
          console.log(`Reminder sent to ${interview.candidate.email}`);
        }
      }
    } catch (error) {
      console.error('Error in reminder job:', error);
    }
  });
};

module.exports = startReminderJob;