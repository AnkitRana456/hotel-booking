import Notification from '../models/Notification.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      pages: Math.ceil(total / limit),
      notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user !== req.user._id) {
      throw new ForbiddenError('Unauthorized action');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// Reusable helper to create in-app notifications
export const createNotification = async ({ userId, title, message, type }) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type
    });
  } catch (error) {
    console.error(`[NOTIFICATION HELPER ERROR] Failed to create:`, error);
  }
};
