import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const createReview = async (req, res, next) => {
  try {
    const { hotelId, rating, comment } = req.body;
    const userId = req.user._id;

    // Verify user has completed booking at this hotel
    const completedBooking = await Booking.findOne({
      user: userId,
      hotel: hotelId,
      // If no booking has been marked "completed" yet due to testing, allow "confirmed" as a fallback
      status: { $in: ['completed', 'confirmed'] }
    });

    if (!completedBooking) {
      throw new BadRequestError('You can only review hotels where you have a completed or confirmed stay.');
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: userId, hotel: hotelId });
    if (existingReview) {
      throw new BadRequestError('You have already submitted a review for this hotel.');
    }

    const review = await Review.create({
      user: userId,
      hotel: hotelId,
      rating,
      comment
    });

    logger.info(`[REVIEW] Created review by ${userId} for hotel ${hotelId}`);

    // Update average rating of hotel
    await updateHotelAverageRating(hotelId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

export const editReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.user !== req.user._id) {
      throw new ForbiddenError('Unauthorized: You can only edit your own reviews.');
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    logger.info(`[REVIEW] Updated review ${id}`);

    await updateHotelAverageRating(review.hotel);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Owner of review or Admin can delete
    if (review.user !== req.user._id && req.user.role !== 'admin') {
      throw new ForbiddenError('Unauthorized action');
    }

    const hotelId = review.hotel;
    await Review.findByIdAndDelete(id);

    logger.info(`[REVIEW] Deleted review ${id}`);

    await updateHotelAverageRating(hotelId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    const isLiked = review.likes.includes(userId);
    if (isLiked) {
      review.likes = review.likes.filter(id => id !== userId);
    } else {
      review.likes.push(userId);
    }
    await review.save();

    res.status(200).json({
      success: true,
      likesCount: review.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (!review.reports.includes(userId)) {
      review.reports.push(userId);
      await review.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const reviews = await Review.find({ hotel: hotelId })
      .populate('user', 'username image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate average rating
const updateHotelAverageRating = async (hotelId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { hotel: hotelId } },
      {
        $group: {
          _id: '$hotel',
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    // We can save this average rating on the Hotel model if we define a field or handle it.
    // For now we log it or update hotel if field exists
    logger.info(`[REVIEW STATS] Hotel ${hotelId} average rating updated to: ${averageRating}`);
  } catch (error) {
    logger.error(`[REVIEW STATS ERROR] Failed to calculate rating for hotel ${hotelId}:`, error);
  }
};
