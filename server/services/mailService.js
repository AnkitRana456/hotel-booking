import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Setup email transporter (mock/sandbox or SMTP if environment variables are set)
let transporter;

try {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Local / fallback sandbox SMTP setup using ethereal or mock
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mock.user@ethereal.email',
        pass: 'mock_pass_123'
      }
    });
  }
} catch (error) {
  logger.error('[MAIL SERVICE] Failed to initialize mail transporter:', error);
}

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    // If SMTP credentials aren't ready, we print to log and skip sending
    if (!process.env.SMTP_HOST) {
      logger.info(`[MOCK MAIL SEND] To: ${to} | Subject: ${subject}`);
      return { success: true, mockSent: true };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"QuickStay Support" <noreply@quickstay.com>',
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`[MAIL SERVICE] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`[MAIL SERVICE] Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

// Ready-to-use HTML Templates
export const getWelcomeTemplate = (username) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #4f46e5;">Welcome to QuickStay!</h2>
    <p>Hi ${username},</p>
    <p>Thank you for registering with QuickStay, the ultimate hotel experience platform. We're excited to have you on board.</p>
    <p>Start discovering your perfect holiday getaway destinations today.</p>
    <br/>
    <p>Best Regards,<br/>The QuickStay Team</p>
  </div>
`;

export const getOtpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #4f46e5;">Verification Code</h2>
    <p>Your verification OTP code is:</p>
    <div style="background-color: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; color: #111827; border-radius: 6px;">
      ${otp}
    </div>
    <p>This code is valid for 15 minutes. If you did not request this code, please ignore this email.</p>
  </div>
`;

export const getBookingConfirmationTemplate = (booking, hotel, room, username = "Guest") => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin-bottom: 20px;">Your Booking Details</h2>
    <p>Dear ${username},</p>
    <p>Thank you for your booking! Here are your details:</p>
    <ul style="list-style-type: disc; padding-left: 20px; line-height: 1.6;">
      <li style="margin-bottom: 8px;"><strong>Booking ID:</strong> ${booking._id}</li>
      <li style="margin-bottom: 8px;"><strong>Hotel Name:</strong> ${hotel.name}</li>
      <li style="margin-bottom: 8px;"><strong>Location:</strong> ${hotel.address}</li>
      <li style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(booking.checkInDate).toDateString()}</li>
      <li style="margin-bottom: 8px;"><strong>Booking Amount:</strong> $ ${room.pricePerNight} /night</li>
    </ul>
    <p>We look forward to welcoming you!</p>
    <p>If you need to make any changes, feel free to contact us.</p>
  </div>
`;

export const getBookingCancellationTemplate = (booking, hotel) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #ef4444;">Booking Cancelled</h2>
    <p>Hi,</p>
    <p>Your booking at <strong>${hotel.name}</strong> from ${new Date(booking.checkInDate).toLocaleDateString()} has been cancelled.</p>
    <p>If you're entitled to a refund, it will be processed shortly to your original payment method.</p>
  </div>
`;

export const getPasswordResetTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
    <h2 style="color: #4f46e5;">Reset Your Password</h2>
    <p>You requested a password reset. Use the OTP code below to reset your password:</p>
    <div style="background-color: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; color: #111827; border-radius: 6px;">
      ${otp}
    </div>
    <p>This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
  </div>
`;
