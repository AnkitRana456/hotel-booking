import express from 'express';
import { 
  createReview, 
  editReview, 
  deleteReview, 
  toggleLikeReview, 
  reportReview, 
  getHotelReviews 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/hotel/:hotelId', getHotelReviews);

// Protected endpoints
router.use(protect);
router.post('/', createReview);
router.put('/:id', editReview);
router.delete('/:id', deleteReview);
router.post('/:id/like', toggleLikeReview);
router.post('/:id/report', reportReview);

export default router;
