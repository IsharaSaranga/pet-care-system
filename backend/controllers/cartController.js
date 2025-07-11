import User from '../models/User.js';

// Add products to user cart
const addToCart = async (req, res) => {
  try {
    console.log('Add to cart request body:', req.body);
    console.log('User from token:', req.user);
    
    const { itemId, size } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!itemId || !size) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item ID and size are required' 
      });
    }

    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'User ID not found' });
    }

    // Find user and validate
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize or get existing cart data
    let cartData = userData.cartData || {};
    
    // Update cart data
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    // Save to database with validation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { cartData } },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user cart');
    }

    // Verify the update
    const verifyUser = await User.findById(userId);
    if (!verifyUser || JSON.stringify(verifyUser.cartData) !== JSON.stringify(cartData)) {
      throw new Error('Cart data verification failed');
    }

    res.json({ 
      success: true, 
      message: "Added to Cart", 
      cartData: updatedUser.cartData 
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update cart'
    });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    console.log('Update cart request body:', req.body);
    console.log('User from token:', req.user);
    
    const { itemId, size, quantity } = req.body;
    const userId = req.user.userId; // Get userId from authenticated user

    console.log('Extracted userId:', userId);

    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'User ID not found' });
    }

    const userData = await User.findById(userId);
    console.log('Found user data:', userData ? 'Yes' : 'No');
    
    if (!userData) return res.status(404).json({ success: false, message: 'User not found' });

    let cartData = userData.cartData || {};
    console.log('Current cart data:', cartData);

    if (cartData[itemId] && cartData[itemId][size] !== undefined) {
      if (quantity <= 0) {
        delete cartData[itemId][size]; // Remove size if quantity is 0
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId]; // Remove item if no sizes remain
        }
      } else {
        cartData[itemId][size] = quantity;
      }
    } else {
      console.log('Item or size not found in cart');
      return res.status(400).json({ success: false, message: 'Item or size not in cart' });
    }

    console.log('Updated cart data:', cartData);

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { cartData },
      { new: true } // Return the updated document
    );
    
    console.log('Database update result:', updatedUser ? 'Success' : 'Failed');
    
    res.json({ success: true, message: "Cart Updated", cartData });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    console.log('Get cart request - User from token:', req.user);
    
    const userId = req.user.userId; // Get userId from authenticated user
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'User ID not found' });
    }
    
    const userData = await User.findById(userId);
    console.log('Found user data:', userData ? 'Yes' : 'No');
    
    if (!userData) return res.status(404).json({ success: false, message: 'User not found' });

    const cartData = userData.cartData || {};
    console.log('Retrieved cart data:', cartData);
    
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear user cart
const clearCart = async (req, res) => {
  try {
    console.log('Clear cart request - User from token:', req.user);
    
    const userId = req.user.userId; // Get userId from authenticated user
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ success: false, message: 'User ID not found' });
    }

    const userData = await User.findById(userId);
    console.log('Found user data:', userData ? 'Yes' : 'No');
    
    if (!userData) return res.status(404).json({ success: false, message: 'User not found' });

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { cartData: {} },
      { new: true } // Return the updated document
    );
    
    console.log('Database update result:', updatedUser ? 'Success' : 'Failed');
    
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart, clearCart };