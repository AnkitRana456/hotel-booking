import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: false // Null indicates a global system/admin notification
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'approval', 'system'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for query optimization
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
