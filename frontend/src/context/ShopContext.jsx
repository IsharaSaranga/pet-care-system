import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '$';
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // Always read the token from localStorage (set by UserHeader.jsx)
  const getToken = () => localStorage.getItem('petOwnerToken');

  // Debug: Log the token value on every render
  useEffect(() => {
    console.log('ShopContext: petOwnerToken in localStorage:', getToken());
  });

  // On initial load and when token changes, sync cart
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserCart(token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      const localCart = localStorage.getItem('localCart');
      setCartItems(localCart ? JSON.parse(localCart) : {});
    }
    // eslint-disable-next-line
  }, []);

  // Listen for storage events (token changes in other tabs or after logout)
  useEffect(() => {
    const syncToken = () => {
      const token = getToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchUserCart(token);
      } else {
        delete axios.defaults.headers.common['Authorization'];
        const localCart = localStorage.getItem('localCart');
        setCartItems(localCart ? JSON.parse(localCart) : {});
      }
    };
    window.addEventListener('storage', syncToken);
    return () => window.removeEventListener('storage', syncToken);
  }, []);

  // Refresh cart/token state on every route change
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserCart(token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      const localCart = localStorage.getItem('localCart');
      setCartItems(localCart ? JSON.parse(localCart) : {});
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem('localCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const fetchUserCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      if (error.response?.status === 401) {
        delete axios.defaults.headers.common['Authorization'];
        const localCart = localStorage.getItem('localCart');
        setCartItems(localCart ? JSON.parse(localCart) : {});
        toast.error('Session expired. Please login again.');
      }
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error('Select Product Size');
      return;
    }
    const originalCartItems = structuredClone(cartItems);
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    
    // Show success notification for adding to cart
    toast.success('Product added to cart!');

    const token = getToken();
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.data.success) {
          toast.error(response.data.message );
          setCartItems(originalCartItems);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          delete axios.defaults.headers.common['Authorization'];
          const localCart = localStorage.getItem('localCart');
          setCartItems(localCart ? JSON.parse(localCart) : {});
          toast.error('Session expired. Please login again.');
        } else {
          toast.error(error.response?.data?.message);
          setCartItems(originalCartItems);
        }
      }
    } else {
      localStorage.setItem('localCart', JSON.stringify(cartData));
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const originalCartItems = structuredClone(cartItems);
    let cartData = structuredClone(cartItems);
    if (quantity <= 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      cartData[itemId][size] = quantity;
    }
    setCartItems(cartData);

    const token = getToken();
    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.data.success) {
          
          setCartItems(originalCartItems);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          delete axios.defaults.headers.common['Authorization'];
          const localCart = localStorage.getItem('localCart');
          setCartItems(localCart ? JSON.parse(localCart) : {});
          toast.error('Session expired. Please login again.');
        } else {
          
          setCartItems(originalCartItems);
        }
      }
    } else {
      localStorage.setItem('localCart', JSON.stringify(cartData));
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          console.error('getCartCount error:', error);
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0 && itemInfo) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.error('getCartAmount error:', error);
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('getProductsData error:', error);
      toast.error(error.message || 'Error fetching products');
    }
  };

  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      toast.error('Please login to continue');
      return false;
    }
    return true;
  };

  useEffect(() => {
    getProductsData();
  }, []);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    backendUrl,
    checkAuth,
  };

  return <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>;
};

export default ShopContextProvider;