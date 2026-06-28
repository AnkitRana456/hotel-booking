import { getAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    let userId = null;
    let username = "User";
    let email = "unknown@example.com";
    let image = "";

    // 1. Check for custom JWT token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_access_secret_123');
        userId = decoded.id;
      } catch (err) {
        // Custom token expired or malformed.
        // We will fallback to see if it's a valid Clerk token before rejecting.
      }
    }

    // 2. Fallback to Clerk token if custom token was not decoded
    if (!userId) {
      try {
        const clerkAuth = getAuth(req);
        if (clerkAuth && clerkAuth.userId) {
          userId = clerkAuth.userId;
          username = clerkAuth.sessionClaims?.username || "User";
          email = clerkAuth.sessionClaims?.email || "unknown@example.com";
          image = clerkAuth.sessionClaims?.image_url || "";
        }
      } catch (clerkErr) {
        // Clerk parsing failed or not present
      }
    }

    // 2.5. Manual Clerk JWT decode fallback
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub) {
          userId = decoded.sub;
          username = decoded.username || decoded.name || "User";
          email = decoded.email || (decoded.emails && decoded.emails[0]) || "unknown@example.com";
          image = decoded.image_url || decoded.picture || "";
          logger.info(`[AUTH] Decoded Clerk token manually: ${userId}`);
        }
      } catch (err) {
        logger.error(`[AUTH] Manual Clerk decode failed: ${err.message}`);
      }
    }

    // 3. Reject if neither is present
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token missing or invalid. Please log in." 
      });
    }

    // 4. Fetch or create user record in MongoDB
    let user = await User.findById(userId);
    if (!user) {
      // Create user document if it doesn't exist yet (e.g. first login via Clerk or local)
      user = await User.create({
        _id: userId,
        username,
        email,
        image,
        role: "user",
        isVerified: true
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[AUTH MIDDLEWARE] Error:", error);
    res.status(500).json({ success: false, message: "Authentication parsing error" });
  }
};

// Reusable role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    // Admin has superuser status and bypasses all role checks
    if (req.user.role === 'admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Access restricted. Required role: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};
