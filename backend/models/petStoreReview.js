//review model
import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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
    minlength: [1, 'Comment cannot be empty']
  },
  userName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create a compound index to ensure one review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model('petStoreReview', reviewSchema);
export default Review; 