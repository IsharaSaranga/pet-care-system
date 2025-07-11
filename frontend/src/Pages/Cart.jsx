import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import CartTotal from '../Component/CartTotal';
import { toast } from 'react-toastify';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const tempData = [];
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item],
          });
        }
      }
    }
    console.log('Cart data:', tempData);
    setCartData(tempData);
  }, [cartItems]);

  const handleCheckout = () => {
    console.log('Checkout button clicked');
    
    
    
    const token = localStorage.getItem('petOwnerToken');
    console.log('Token in handleCheckout:', token);
    
    if (token) {
      console.log('User is logged in, navigating to placeOrder');
      navigate('/placeOrder', { replace: true });
    } else {
      console.log('User is not logged in, navigating to login');
      toast.error('Please login to continue');
      navigate('/login', { 
        state: { 
          from: { 
            pathname: '/placeOrder',
            
          } 
        } 
      });
    }
  };

  return (
    <div className='bg-amber-50 min-h-screen pt-32 px-4 md:px-16'>
      <div className='mb-6'>
        <h1 className='text-3xl md:text-4xl font-bold text-amber-900 mb-2'>Your <span className='text-amber-800'>Cart</span></h1>
      </div>

      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id);

          return (
            <div
              key={index}
              className='py-4 mb-4 bg-white rounded-xl shadow-md border border-amber-200 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >
              <div className='ml-5 flex items-start gap-6'>
                {productData && productData.image && productData.image[0] ? (
                  <img
                    src={productData.image[0]}
                    alt={productData.name}
                    className='w-16 sm:w-20 rounded-lg border border-amber-200'
                    onError={() => console.error('Failed to load image:', productData.image[0])}
                  />
                ) : (
                  <div className='w-16 sm:w-20 h-16 sm:h-20 bg-amber-100 flex items-center justify-center rounded-lg'>
                    <span>No Image</span>
                  </div>
                )}
                <div>
                  <p className='text-xs sm:text-lg font-semibold text-amber-900'>{productData?.name || 'Unknown Product'}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p className='text-[#D08860] font-bold'>
                      {currency}
                      {productData?.price || 'N/A'}
                    </p>
                    <p className='px-2 sm:px-3 sm:py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-200 font-medium'>{item.size}</p>
                  </div>
                </div>
              </div>
              <input
                onChange={(e) =>
                  e.target.value === '' || e.target.value === '0'
                    ? null
                    : updateQuantity(item._id, item.size, Number(e.target.value))
                }
                className='border border-amber-200 rounded-md max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860]'
                type='number'
                min={1}
                defaultValue={item.quantity}
              />
              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                src={assets.bin_icon}
                alt='delete'
                className='w-4 mr-4 sm:w-5 cursor-pointer hover:scale-110 transition-all duration-200'
              />
            </div>
          );
        })}
      </div>
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px] ml-10 mr-10'>
          <div className='bg-amber-100 rounded-xl shadow p-6 mb-6'>
            <CartTotal />
          </div>
          <div className='w-full text-end'>
            <button
              onClick={handleCheckout}
              className='bg-[#D08860] hover:bg-[#B3714E] text-white font-bold rounded-full shadow-md text-base my-8 px-8 py-3 transition-all duration-200 mr-20'
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;