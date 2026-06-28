import cron from 'node-cron';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Auto-expire pending unpaid bookings after 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const timeThreshold = new Date(Date.now() - 15 * 60 * 1000);
    
    // Update bookings created more than 15 mins ago that are still unpaid and pending
    const result = await Booking.updateMany(
      {
        status: 'pending',
        isPaid: false,
        createdAt: { $lte: timeThreshold }
      },
      {
        $set: { status: 'cancelled' }
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`[CRON] Expired ${result.modifiedCount} pending unpaid bookings.`);
    }
  } catch (error) {
    logger.error('[CRON ERROR] Failed to auto-expire bookings:', error);
  }
});

// Daily cleanup job: Delete expired OTPs and expired tokens (runs every day at midnight)
cron.schedule('0 0 * * *', async () => {
  try {
    const result = await User.updateMany(
      { otpExpires: { $lt: new Date() } },
      {
        $set: { otp: null, otpExpires: null }
      }
    );
    logger.info(`[CRON] Cleaned up expired OTPs for ${result.modifiedCount} users.`);
  } catch (error) {
    logger.error('[CRON ERROR] Failed daily OTP cleanup:', error);
  }
});

logger.info('[CRON] Background schedule jobs registered successfully.');
export default cron;
