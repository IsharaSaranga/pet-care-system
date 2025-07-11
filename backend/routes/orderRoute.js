import express from 'express';
import { 
  placeOrderStripe, 
  getUserOrders, 
  getOrderDetails, 
  updateOrderStatus,
  placeOrder,
  verifyStripe,
  getAllOrders
} from '../controllers/orderController.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Get all orders route
orderRouter.get('/all', authUser, getAllOrders);

// User routes
orderRouter.post('/user', authUser, getUserOrders);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/cod', authUser, placeOrder);
orderRouter.post('/verify', authUser, verifyStripe);

// Order details and status routes
orderRouter.get('/details/:orderId', authUser, getOrderDetails);
orderRouter.put('/status/:orderId', authUser, updateOrderStatus);

export default orderRouter; 