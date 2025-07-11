import express from 'express';
import { addReview, getProductReviews, deleteReview, getUserReviews } from '../controllers/petStoreReviewController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.post('/add', auth, addReview);
router.get('/product/:productId', getProductReviews);
router.delete('/:reviewId', auth, deleteReview);
router.get('/user', auth, getUserReviews);

export default router; 