import express from "express"
import "dotenv/config";
import cors from "cors";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import mongoose from 'mongoose';

import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";

// Import cron jobs to start scheduling
import "./cron/jobs.js";

// Existing routes (backward compatibility)
import { clerkMiddleware } from '@clerk/express'
import clerkRoutes from "./routes/clerkRoutes.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// New API routes
import authRouter from "./routes/authRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import { setupSwagger } from "./configs/swagger.js";

// Connect to Database and Cloudinary
connectDB();
connectCloudinary();

const app = express();
setupSwagger(app);

// Security Headers
app.use(helmet());

// CORS Setup
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Request Body Parser and Parser utilities
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(hpp());

// Body sanitization to prevent NoSQL injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize(req.body);
  if (req.query) mongoSanitize(req.query);
  if (req.params) mongoSanitize(req.params);
  next();
});

// Rate Limiting (Prevent DDoS / Brute Force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 200, // max 200 requests per IP per window
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);

// Global Clerk integration middleware (needed by clerk routes)
app.use(clerkMiddleware());

// HTTP Request logging middleware
app.use((req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'healthy', 
    timestamp: new Date() 
  });
});

// Base API route
app.get('/', (req, res) => {
  res.send("API is Working smoothly");
});

// Register existing clerk webhook routes
app.use("/api", clerkRoutes);

// Mounting Existing API Routes (Backward compatible for frontend)
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// Mounting New Production API Routes
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/notifications', notificationRouter);

// Centralized error handling middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown listener
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing http server gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

export default app;