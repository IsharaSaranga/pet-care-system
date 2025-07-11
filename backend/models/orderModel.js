import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number,
    size: String
  }],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: [
      'Pending',           // Initial state when order is placed
      'Payment Confirmed', // Payment has been verified
      'Processing',        // Order is being prepared
      'Shipped',          // Order has been shipped
      'Out for Delivery', // Order is out for delivery
      'Delivered',        // Order has been delivered
      'Cancelled'         // Order has been cancelled
    ], 
    default: 'Pending' 
  },
  shippingAddress: String,
  createdAt: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Date, default: Date.now }
});

const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;