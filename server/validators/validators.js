import { body, param, query, validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errors.js';

// Reusable middleware to intercept express-validator results and throw custom BadRequestError
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => `${err.path}: ${err.msg}`).join('. ');
    return next(new BadRequestError(errorMsg));
  }
  next();
};

export const registerValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['user', 'hotelOwner', 'admin'])
    .withMessage('Invalid user role'),
  validate
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

export const bookingValidator = [
  body('room')
    .trim()
    .notEmpty()
    .withMessage('Room ID is required'),
  body('checkInDate')
    .isISO8601()
    .withMessage('Check-in must be a valid date (YYYY-MM-DD)'),
  body('checkOutDate')
    .isISO8601()
    .withMessage('Check-out must be a valid date (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.checkInDate)) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    }),
  body('guests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Guests must be a number between 1 and 10'),
  validate
];

export const roomValidator = [
  body('roomType')
    .trim()
    .notEmpty()
    .withMessage('Room type is required'),
  body('pricePerNight')
    .isFloat({ min: 1 })
    .withMessage('Price per night must be a number greater than 0'),
  body('amenities')
    .notEmpty()
    .withMessage('Amenities list is required'),
  validate
];

export const hotelValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Hotel name is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('contact')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City location is required'),
  validate
];

export const reviewValidator = [
  body('hotelId')
    .trim()
    .notEmpty()
    .withMessage('Hotel ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Review comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  validate
];
