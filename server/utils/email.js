const nodemailer = require('nodemailer');

const EMAIL  = process.env.EMAIL_USER;
const PASS   = process.env.EMAIL_PASS;
const SENDER = `"Campus Recruit" <${EMAIL}>`;

if (!EMAIL || !PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS missing in .env — emails will not send');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL, pass: PASS },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('✉️ Email transporter verification error:', error.message);
  } else {
    console.log('✉️ Email transporter is ready and connected!');
  }
});

const sendOTPEmail = async (userEmail, otp) => {
  const mailOptions = {
    from: SENDER,
    to: userEmail,
    subject: 'Verify Your Account — Campus Recruit',
    html: `
      <div style="background-color: #0f172a; padding: 40px 20px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px;">
          <h2 style="color: #c084fc; font-size: 28px; font-weight: bold; text-align: center; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Please use the following verification code to complete your process. This code is valid for 10 minutes.</p>
          <div style="background-color: #1e1b4b; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; color: #d8b4fe; letter-spacing: 12px; font-family: monospace; font-weight: bold;">${otp}</span>
          </div>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruiting Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ OTP email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

const sendPasswordResetEmail = async (userEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: SENDER,
    to: userEmail,
    subject: 'Reset Your Password — Campus Recruit',
    html: `
      <div style="background-color: #0f172a; padding: 40px 20px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px;">
          <h2 style="color: #c084fc; font-size: 28px; font-weight: bold; text-align: center; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new one.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #9333ea, #a855f7); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #94a3b8; font-size: 14px;">${resetUrl}</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-top: 20px;">This link will expire in 15 minutes.</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">If you didn't request a password reset, please ignore this email.</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruiting Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Password reset email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

const sendAccountApprovalEmail = async (userEmail, userName) => {
  const loginUrl = 'http://localhost:5176/login';
  
  const mailOptions = {
    from: SENDER,
    to: userEmail,
    subject: '🎉 Account Approved — Campus Recruit',
    html: `
      <div style="background-color: #0f172a; padding: 40px 20px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px;">
          <h2 style="color: #c084fc; font-size: 28px; font-weight: bold; text-align: center; margin-top: 0;">Account Approved!</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Hello ${userName || 'User'},</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Great news! Your account has been approved. You can now log in and start using the platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #9333ea, #a855f7); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login Now</a>
          </div>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">If you have any questions, feel free to reply to this email.</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruiting Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Account approval email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

const sendOTPForPasswordReset = async (userEmail, otp) => {
  const mailOptions = {
    from: SENDER,
    to: userEmail,
    subject: 'Password Reset OTP — Campus Recruit',
    html: `
      <div style="background-color: #0f172a; padding: 40px 20px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px;">
          <h2 style="color: #c084fc; font-size: 28px; font-weight: bold; text-align: center; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Your OTP code for resetting your password is:</p>
          <div style="background-color: #1e1b4b; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; color: #d8b4fe; letter-spacing: 12px; font-family: monospace; font-weight: bold;">${otp}</span>
          </div>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">This OTP will expire in 10 minutes.</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-top: 20px;">If you didn't request a password reset, please ignore this email to keep your account safe.</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruiting Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Password reset OTP email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

const sendPaymentSuccessEmail = async (userEmail, userName, courseTitle, price = 0, paymentMethod = 'Card') => {
  const formattedPrice = typeof price === 'number' ? `₹${price}` : price;
  
  const mailOptions = {
    from: SENDER,
    to: userEmail,
    subject: 'Course Purchase Confirmation — Campus Recruit',
    html: `
      <div style="background-color: #0f172a; padding: 40px 20px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #0a0e17; border-radius: 16px; padding: 40px 30px;">
          <h2 style="color: #c084fc; font-size: 28px; font-weight: bold; text-align: center; margin-top: 0;">Congratulations!</h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Hello ${userName || 'Student'},</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Your payment has been successfully completed and your enrollment is confirmed.</p>
          <div style="background-color: #1e1b4b; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <p style="color: #cbd5e1; margin: 5px 0; font-size: 15px;"><strong style="color: #e2e8f0;">Course Name:</strong> ${courseTitle}</p>
            <p style="color: #cbd5e1; margin: 5px 0; font-size: 15px;"><strong style="color: #e2e8f0;">Amount Paid:</strong> ${formattedPrice}</p>
            <p style="color: #cbd5e1; margin: 5px 0; font-size: 15px;"><strong style="color: #e2e8f0;">Payment Method:</strong> ${paymentMethod}</p>
          </div>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">You can now access your dashboard and start learning.</p>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5; margin-top: 20px;">Thank you for learning with us!</p>
          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Campus Recruiting Team. All rights reserved.</p>
          </div>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Payment email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

module.exports = { transporter, sendPaymentSuccessEmail, sendOTPEmail, sendPasswordResetEmail, sendAccountApprovalEmail, sendOTPForPasswordReset };
