import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../Component/RelatedProducts';
import axios from 'axios';

const Product = () => {
    const { ProductId } = useParams();
    const { products, currency, addToCart, backendUrl } = useContext(ShopContext);
    const [ProductData, setProductData] = useState(null);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');
    const [activeTab, setActiveTab] = useState('description'); // Track which tab is active
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = () => {
            const foundProduct = products.find((item) => item._id.toString() === ProductId);
            if (foundProduct) {
                setProductData(foundProduct);
                setImage(foundProduct.image[0]);
                return null;
            }
        };
        fetchProductData();
    }, [ProductId, products]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/petStoreReviews/product/${ProductId}`);
                if (response.data.success) {
                    setReviews(response.data.reviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [ProductId, backendUrl]);

    if (!ProductData) return <div className='opacity-0'></div>;

    const isOutOfStock = ProductData.quantity === 0;

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className='bg-amber-50 min-h-screen pt-32 px-4 md:px-16 transition-opacity ease-in duration-500 opacity-100'>
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* Image Section */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                        {ProductData.image.map((item, index) => (
                            <img
                                onClick={() => setImage(item)}
                                src={item}
                                key={index}
                                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-xl border border-amber-200 hover:border-[#D08860] transition-all duration-200'
                                alt={`Product thumbnail ${index}`}
                            />
                        ))}
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img className='w-full h-auto rounded-2xl border border-amber-200 shadow-md' src={image} alt='Selected product' />
                    </div>
                </div>

                {/* Product Details */}
                <div className='flex-1'>
                    <h1 className='font-bold text-3xl text-amber-900 mb-2'>{ProductData.name}</h1>
                    
                    {/* Star Ratings */}
                    <div className='flex items-center gap-1 mt-2'>
                        
                               
                    </div>

                    <p className='mt-5 text-3xl font-bold text-[#D08860]'>{currency}{ProductData.price}</p>
                    
                    {/* Stock Status */}
                    <div className='mt-3'>
                        {isOutOfStock ? (
                            <p className='text-red-600 font-medium'>Out of Stock</p>
                        ) : (
                            <p className='text-green-600 font-medium'>In Stock ({ProductData.quantity} available)</p>
                        )}
                    </div>

                    <p className='mt-5 text-amber-800 md:w-4/5'>{ProductData.description}</p>

                    {/* Size Selection */}
                    <div className='flex flex-col gap-4 my-8'>
                        <p className='font-semibold text-amber-900'>Select Size</p>
                        <div className='flex gap-2'>
                            {ProductData.sizes?.map((item, index) => (
                                <button
                                    onClick={() => setSize(item)}
                                    className={`border py-2 px-4 bg-amber-100 rounded-full text-amber-900 font-medium shadow-sm transition-all duration-200 ${item === size ? 'border-[#D08860] bg-[#D08860] text-white' : 'border-amber-200 hover:border-[#D08860] hover:bg-amber-200'}`}
                                    key={index}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => addToCart(ProductData._id, size)} 
                        disabled={isOutOfStock || !size}
                        className={`${
                            isOutOfStock 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : !size 
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#D08860] hover:bg-[#B3714E]'
                        } text-white px-8 py-3 text-base rounded-full font-bold shadow-md transition-all duration-200`}
                    >
                        {isOutOfStock ? 'OUT OF STOCK' : !size ? 'SELECT SIZE' : 'ADD TO CART'}
                    </button>

                    <hr className='mt-8 sm:w-4/5 border-amber-200'/> 
                    <div className='text-sm text-amber-700 mt-5 flex flex-col gap-1'>
                        <p>✅ 100% Original Product</p>
                        <p>💰 Cash on delivery available</p>
                        <p>🔄 Easy return & exchange policy</p>
                    </div>        
                </div>  
            </div>

            {/* Description & Reviews Section */}
            <div className='mt-20'>
                <div className='flex'>
                    <button 
                        className={`border border-amber-200 px-5 py-3 text-base rounded-t-lg font-semibold transition-all duration-200 ${activeTab === 'description' ? 'bg-amber-100 text-amber-900' : 'bg-white text-amber-700 hover:bg-amber-50'}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button 
                        className={`border border-amber-200 px-5 py-3 text-base rounded-t-lg font-semibold transition-all duration-200 ${activeTab === 'reviews' ? 'bg-amber-100 text-amber-900' : 'bg-white text-amber-700 hover:bg-amber-50'}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({reviews.length})
                    </button>
                </div>  

                {/* Show Content Based on Active Tab */}
                {activeTab === 'description' && (
                    <div className='flex flex-col gap-4 border border-amber-200 bg-white px-6 py-6 text-base text-amber-700 rounded-b-lg'>
                        <p>{ProductData.description}</p>
                    </div>  
                )}

                {activeTab === 'reviews' && (
                    <div className='flex flex-col gap-4 border border-amber-200 bg-white px-6 py-6 text-base text-amber-700 rounded-b-lg'>
                        {loading ? (
                            <p>Loading reviews...</p>
                        ) : reviews.length === 0 ? (
                            <p>No reviews yet. Be the first to review this product!</p>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-2xl font-bold text-amber-900">{averageRating}</div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={`text-xl ${
                                                    star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-amber-700">({reviews.length} reviews)</span>
                                </div>
                                {reviews.map((review) => (
                                    <div key={review._id} className="border-b border-amber-100 pb-4 last:border-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`text-sm ${
                                                            star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="font-semibold text-amber-900">{review.userName}</span>
                                            <span className="text-sm text-amber-600">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-amber-700">{review.comment}</p>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>  
                )}
            </div>

            {/* Related Products */}
            <RelatedProducts category={ProductData?.category} subCategory={ProductData?.subCategory} />
        </div>
    );
};

export default Product;
