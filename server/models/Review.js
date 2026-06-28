import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  hotel: {
    type: String,
    ref: 'Hotel',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: {
    type: [String], // Array of User IDs who liked the review
    default: []
  },
  reports: {
    type: [String], // Array of User IDs who reported the review
    default: []
  }
}, { timestamps: true });

// Prevent duplicate reviews from the same user for a single hotel
reviewSchema.index({ user: 1, hotel: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
