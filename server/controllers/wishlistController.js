import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const addToWishlist = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.user._id;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    const user = await User.findById(userId);
    if (user.wishlist.includes(hotelId)) {
      return res.status(200).json({ success: true, message: 'Hotel already in wishlist' });
    }

    user.wishlist.push(hotelId);
    await user.save();

    logger.info(`[WISHLIST] Added hotel ${hotelId} to user ${userId} wishlist`);

    res.status(200).json({
      success: true,
      message: 'Added to wishlist successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { hotelId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(id => id !== hotelId);
    await user.save();

    logger.info(`[WISHLIST] Removed hotel ${hotelId} from user ${userId} wishlist`);

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist successfully',
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: {
        path: 'owner',
        select: 'username image'
      }
    });

    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};
