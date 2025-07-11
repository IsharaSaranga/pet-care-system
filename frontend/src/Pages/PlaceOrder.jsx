import { useContext, useState, useEffect } from 'react'
import MarketplaceTitle from '../Component/MarketplaceTitle'
import CartTotal from '../Component/CartTotal'
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BACKEND_URL } from '../config'

const PlaceOrder = () => {
  const { 
    cartItems, 
    getCartAmount, 
    updateQuantity 
  } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState('COD');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  
  // Check if user is logged in and if cart has items
  useEffect(() => {
    // Check if cart is empty
    let hasItems = false;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          hasItems = true;
          break;
        }
      }
      if (hasItems) break;
    }
    
    if (!hasItems) {
      navigate('/collection');
      return;
    }
    
    const token = localStorage.getItem('petOwnerToken');
    if (!token) {
      localStorage.setItem('returnUrl', location.pathname);
      toast.error("Please login to place an order");
      navigate('/login');
    }
  }, [navigate, location, cartItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!localStorage.getItem('petOwnerToken')) {
      localStorage.setItem('returnUrl', location.pathname);
      toast.error("Please login to place an order");
      navigate('/login');
      return;
    }
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country || !formData.phone) {
        toast.error("Please fill in all required fields");
        return;
    }

    try {
        // Prepare cart items for order
        const orderItems = [];
        for (const itemId in cartItems) {
            if (typeof cartItems[itemId] === 'object') {
                for (const size in cartItems[itemId]) {
                    const quantity = cartItems[itemId][size];
                    if (quantity > 0) {
                        orderItems.push({
                            _id: itemId,
                            size: size,
                            quantity: quantity
                        });
                    }
                }
            }
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Get user ID from token
        const token = localStorage.getItem('petOwnerToken');
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData.userId;

        const orderData = {
            userId: userId,
            items: orderItems,
            amount: getCartAmount(),
            address: `${formData.firstName} ${formData.lastName}\n${formData.street}\n${formData.city}, ${formData.state} ${formData.zipCode}\n${formData.country}\nPhone: ${formData.phone}\nEmail: ${formData.email}`
        };

        console.log("Sending order data:", orderData);

        let response;
        if (method === "Stripe") {
            response = await axios.post(`${BACKEND_URL}/api/order/stripe`, orderData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                // Clear cart items
                for (const itemId in cartItems) {
                    for (const size in cartItems[itemId]) {
                        updateQuantity(itemId, size, 0);
                    }
                }
                window.location.href = response.data.session_url;
            }
        } else {
            response = await axios.post(`${BACKEND_URL}/api/order/cod`, orderData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Order response:", response.data);
            
            if (response.data.success) {
                // Clear cart items
                for (const itemId in cartItems) {
                    for (const size in cartItems[itemId]) {
                        updateQuantity(itemId, size, 0);
                    }
                }
                toast.success("Order placed successfully!");
                navigate('/orders');
            } else {
                toast.error(response.data.message );
            }
        }
    } catch (error) {
        console.error("Order placement error:", error);
        if (error.response) {
            console.error("Error response:", error.response.data);
            toast.error(error.response.data.message );
        } else if (error.request) {
            console.error("Error request:", error.request);
           
        } else {
            console.error("Error message:", error.message);
            toast.error("An error occurred. Please try again.");
        }
    }
  };

  return (
    <div className='bg-amber-50 min-h-screen pt-32 px-4 md:px-16' >
      <form onSubmit={handlePlaceOrder} className='max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-8 '>
        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-amber-900 mb-2'>Delivery <span className='text-amber-800'>Information</span></h1>
        </div>
        <div className='flex flex-col gap-4'>
          <div className='flex gap-3'>
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='text' 
              name='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder='First Name'
              required
            />
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='text' 
              name='lastName'
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder='Last Name'
              required
            />
          </div>
          <input 
            className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
            type='email' 
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            placeholder='Email address'
            required
          />
          <input 
            className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
            type='text' 
            name='street'
            value={formData.street}
            onChange={handleInputChange}
            placeholder='Street'
            required
          />
          <div className='flex gap-3'>
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='text' 
              name='city'
              value={formData.city}
              onChange={handleInputChange}
              placeholder='City'
              required
            />
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='text' 
              name='state'
              value={formData.state}
              onChange={handleInputChange}
              placeholder='State'
              required
            />
          </div>
          <div className='flex gap-3'>
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='number' 
              name='zipCode'
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder='Zip Code'
              required
            />
            <input 
              className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
              type='text' 
              name='country'
              value={formData.country}
              onChange={handleInputChange}
              placeholder='Country'
              required
            />
          </div>
          <input 
            className='border border-amber-200 bg-amber-50 rounded-lg py-2 px-4 w-full focus:ring-2 focus:ring-[#D08860] focus:border-[#D08860] text-amber-900' 
            type='tel' 
            name='phone'
            value={formData.phone}
            onChange={handleInputChange}
            placeholder='Phone'
            required
          />
        </div>
        <div className='bg-amber-100 rounded-xl shadow p-6 mt-4'>
          <CartTotal/>
        </div>
        <div>
          <h2 className='text-2xl font-bold text-amber-900 mt-8 mb-4'>Payment <span className='text-amber-800'>Method</span></h2>
          <div className='flex gap-4 flex-col lg:flex-row'>
            <div className={`flex items-center gap-3 border-2 p-3 px-5 rounded-lg cursor-pointer transition-all duration-200 ${method === 'Stripe' ? 'border-[#D08860] bg-amber-100' : 'border-amber-200 bg-white'}`} onClick={() => setMethod('Stripe')}>
              <span className={`min-w-3.5 h-3.5 border rounded-full ${method === 'Stripe' ? 'bg-green-400 border-green-400' : 'border-amber-200'}`}></span>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
              <span className='text-amber-900 font-medium'>Stripe</span>
            </div>
            <div className={`flex items-center gap-3 border-2 p-3 px-5 rounded-lg cursor-pointer transition-all duration-200 ${method === 'COD' ? 'border-[#D08860] bg-amber-100' : 'border-amber-200 bg-white'}`} onClick={() => setMethod('COD')}>
              <span className={`min-w-3.5 h-3.5 border rounded-full ${method === 'COD' ? 'bg-green-400 border-green-400' : 'border-amber-200'}`}></span>
              <span className='text-amber-900 font-medium mx-4'>Cash on Delivery</span>
            </div>
          </div>
          <div className='w-full text-end mt-8'>
            <button type="submit" className='bg-[#D08860] hover:bg-[#B3714E] text-white font-bold rounded-full shadow-md text-base px-16 py-3 transition-all duration-200'>PLACE ORDER</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PlaceOrder
