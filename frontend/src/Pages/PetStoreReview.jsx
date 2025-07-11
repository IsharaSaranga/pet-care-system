import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PetStoreReview = () => {
  const { backendUrl } = useContext(ShopContext);
  const { productId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      console.log('ProductId from params:', productId);

      if (!productId) {
        console.error('Product ID is missing');
        toast.error('Product ID is missing');
        navigate('/collection');
        return;
      }

      try {
        console.log('Fetching product data for ID:', productId);
        const response = await axios.post(
          `${backendUrl}/api/product/single`,
          { productId: productId },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Product data response:', response.data);

        if (response.data.success) {
          setProductData(response.data.product);
        } else {
          console.error('Failed to load product data:', response.data.message);
          toast.error(response.data.message || 'Failed to load product data');
          navigate('/collection');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(error.response?.data?.message || 'Error loading product data');
        navigate('/collection');
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId, backendUrl, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productId) {
      toast.error('Product ID is missing');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('petOwnerToken');
      if (!token) {
        toast.error('Please login to add a review');
        navigate('/login');
        return;
      }

      console.log('Submitting review for product:', productId);
      const response = await axios.post(
        `${backendUrl}/api/petStoreReviews/add`,
        { 
          productId: productId,
          rating, 
          comment 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Review submission response:', response.data);

      if (response.data.success) {
        toast.success('Review added successfully');
        navigate(`/product/${productId}`);
      } else {
        throw new Error(response.data.message || 'Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.message || 'Error adding review';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!productData) {
    return (
      <div className="bg-amber-50 min-h-screen pt-32 px-4 md:px-16">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <p className="text-center text-amber-900">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 min-h-screen pt-32 px-4 md:px-16">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-amber-900 mb-6">Write a Review</h1>
        <div className="mb-6">
          <h2 className="text-xl text-amber-800 mb-2">Product: {productData.name}</h2>
          <img 
            src={productData.image[0]} 
            alt={productData.name} 
            className="w-32 h-32 object-cover rounded-lg border border-amber-200"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Selection */}
          <div>
            <label className="block text-amber-900 font-semibold mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-amber-900 font-semibold mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-400"
              rows="4"
              placeholder="Write your review here..."
              maxLength={500}
            />
            <p className="text-sm text-amber-600 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full font-bold text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#D08860] hover:bg-[#B3714E]'
            } transition-all duration-200`}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PetStoreReview; 