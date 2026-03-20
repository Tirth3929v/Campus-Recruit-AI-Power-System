const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    pass: process.env.EMAIL_PASS || 'odcdpthyyhawcldj'
  }
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
    from: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    to: userEmail,
    subject: 'Verify Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Verify Your Account</h2>
        <p>Your verification code is:</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p style="margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Campus Recruiting Team</p>
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
    from: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    to: userEmail,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Reset Your Password</h2>
        <p>Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p style="margin-top: 20px;">This link will expire in 15 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Campus Recruiting Team</p>
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
    from: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    to: userEmail,
    subject: 'Account Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #10b981;">Account Approved!</h2>
        <p>Hello ${userName || 'User'},</p>
        <p>Your account has been approved. You can now log in.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #10b981, #0ea5e9); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Login Now</a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Campus Recruiting Team</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Account approval email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

const sendOTPForPasswordReset = async (userEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    to: userEmail,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Reset Your Password</h2>
        <p>Your OTP code for password reset is:</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8b5cf6;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Campus Recruiting Team</p>
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
    from: process.env.EMAIL_USER || 'vivekvala249@gmail.com',
    to: userEmail,
    subject: 'Course Purchase Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">Congratulations!</h2>
        <p>Hello ${userName || 'Student'},</p>
        <p>Your payment has been successfully completed.</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ${formattedPrice}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>
        <p>You can now start learning the course.</p>
        <p style="margin-top: 20px;">Thank you for learning with us.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Campus Recruiting Team</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Payment email sent to', userEmail, 'Message ID:', info.messageId);
  return info;
};

module.exports = { sendPaymentSuccessEmail, sendOTPEmail, sendPasswordResetEmail, sendAccountApprovalEmail, sendOTPForPasswordReset };
