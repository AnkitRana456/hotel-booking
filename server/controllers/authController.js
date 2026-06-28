import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError, 
  ConflictError 
} from '../utils/errors.js';
import logger from '../utils/logger.js';
import nodemailer from 'nodemailer';

// Helper to generate access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_access_secret_123',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Helper for cookie options
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    // Generate custom unique ID for local user registration
    const customId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Generate 6-digit verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      _id: customId,
      username,
      email,
      password,
      role: role || 'user',
      isVerified: false,
      otp,
      otpExpires
    });

    logger.info(`[AUTH] User registered successfully: ${user._id} (${user.email})`);

    // In a real application, we would send this via mailService. For now, we print to log and send mock email.
    logger.info(`[MOCK MAIL] Verification OTP for ${user.email} is: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification OTP sent to email.',
      userId: user._id
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in user session list
    user.refreshTokens.push(refreshToken);
    // Keep max 5 active device sessions
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    await user.save();

    logger.info(`[AUTH] User logged in: ${user._id}`);

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const oldRefreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', getCookieOptions());

    const user = await User.findOne({ refreshTokens: oldRefreshToken });

    // Refresh Token Reuse Detection / Fraud Prevention
    if (!user) {
      try {
        // Someone attempted to use a reused/invalid refresh token
        const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123');
        logger.warn(`[AUTH DETECTED REUSE] Refresh token reuse detected for user ${decoded.id}. Clearing all sessions.`);
        // Invalidate all tokens for that user
        const hackedUser = await User.findById(decoded.id);
        if (hackedUser) {
          hackedUser.refreshTokens = [];
          await hackedUser.save();
        }
      } catch (err) {
        // Token was invalid anyway
      }
      throw new UnauthorizedError('Token reuse detected or session expired. Please login again.');
    }

    // Verify token validity
    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123');
    } catch (err) {
      // Remove expired refresh token from DB
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== oldRefreshToken);
      await user.save();
      throw new UnauthorizedError('Session expired. Please login again.');
    }

    // Rotate refresh token
    const newTokens = generateTokens(user);
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== oldRefreshToken);
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    res.cookie('refreshToken', newTokens.refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: newTokens.accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(204).json({ success: true, message: 'Logged out successfully' });
    }

    const refreshToken = cookies.refreshToken;
    res.clearCookie('refreshToken', getCookieOptions());

    // Remove token from database
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
      await user.save();
      logger.info(`[AUTH] Single-device logout complete for: ${user._id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = [];
      await user.save();
      logger.info(`[AUTH] Multi-device logout complete for: ${user._id}`);
    }

    res.clearCookie('refreshToken', getCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    logger.info(`[AUTH] Email verified for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('No account registered with this email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    logger.info(`[AUTH] Password reset OTP generated for: ${user.email}`);
    logger.info(`[MOCK MAIL] Password reset OTP for ${user.email} is: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to registered email'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.otp !== otp || user.otpExpires < new Date()) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    user.password = password;
    user.otp = null;
    user.otpExpires = null;
    user.refreshTokens = []; // Clear all current active sessions for security
    await user.save();

    logger.info(`[AUTH] Password successfully reset for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect current password');
    }

    user.password = newPassword;
    user.refreshTokens = []; // clear sessions
    await user.save();

    logger.info(`[AUTH] Password changed successfully for user: ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    next(error);
  }
};
