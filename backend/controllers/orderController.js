import orderModel from '../models/orderModel.js';
import User from '../models/User.js';
import productModel from '../models/productModel.js';
import Stripe from "stripe";
import { updateProductQuantity } from './productController.js';

//global variables
const currency = 'usd';
const deliveryCharge = 2;

//gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req,res)=>{
    try {
        const {userId,items,amount,address}=req.body;
        
        // Validate required fields
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({success:false,message:"Missing required fields"});
        }

        // Fetch product details and update quantities
        const productsWithDetails = await Promise.all(items.map(async (item) => {
            const product = await productModel.findById(item._id);
            if (!product) {
                throw new Error(`Product not found: ${item._id}`);
            }

            // Check if enough quantity is available
            if (product.quantity < item.quantity) {
                throw new Error(`Not enough quantity available for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
            }

            // Update product quantity
            const newQuantity = product.quantity - item.quantity;
            product.quantity = newQuantity;
            await product.save();

            return {
                productId: item._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                size: item.size
            };
        }));

        const orderData={
            userId,
            products: productsWithDetails,
            totalPrice: amount,
            shippingAddress: address,
            paymentMethod:"COD",
            payment:false,
            date:Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Clear user's cart after successful order
        await User.findByIdAndUpdate(userId,{cartData:{}});

        res.json({success:true,message:"Order placed successfully",order:newOrder});
    } catch (error) {
        console.log("Place order error:",error);
        res.status(500).json({success:false,message:error.message});
    }
}


const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
        const { origin } = req.headers;

        // Validate required fields
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({success:false,message:"Missing required fields"});
        }

        // Fetch product details and update quantities
        const productsWithDetails = await Promise.all(items.map(async (item) => {
            const product = await productModel.findById(item._id);
            if (!product) {
                throw new Error(`Product not found: ${item._id}`);
            }

            // Check if enough quantity is available
            if (product.quantity < item.quantity) {
                throw new Error(`Not enough quantity available for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`);
            }

            // Update product quantity
            const newQuantity = product.quantity - item.quantity;
            product.quantity = newQuantity;
            await product.save();

            return {
                productId: item._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                size: item.size
            };
        }));

        const orderData = {
            userId,
            products: productsWithDetails,
            totalPrice: amount,
            shippingAddress: address,
            paymentMethod: "Stripe",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        const line_items = productsWithDetails.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: `${item.name} (${item.size})`
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/verify?success=false&session_id={CHECKOUT_SESSION_ID}`,
            line_items,
            mode: 'payment',
            metadata: {
                orderId: newOrder._id.toString()
            }
        });
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//verify stripe
const verifyStripe = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status === "paid") {
            const orderId = session.metadata.orderId;
            const order = await orderModel.findById(orderId);
            if (order) {
                order.payment = true;
                await order.save();
                res.json({ success: true, message: "Payment verified successfully" });
            } else {
                res.status(404).json({ success: false, message: "Order not found" });
            }
        } else {
            // If payment failed, restore quantities
            const orderId = session.metadata.orderId;
            const order = await orderModel.findById(orderId);
            if (order) {
                // Restore quantities for each product
                for (const product of order.products) {
                    const productDoc = await productModel.findById(product.productId);
                    if (productDoc) {
                        productDoc.quantity += product.quantity;
                        await productDoc.save();
                    }
                }
                // Delete the failed order
                await orderModel.findByIdAndDelete(orderId);
            }
            res.status(400).json({ success: false, message: "Payment not completed" });
        }
    } catch (error) {
        console.log("Verify stripe error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate({
                path: 'userId',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        if (!orders) {
            return res.status(404).json({ 
                success: false, 
                message: 'No orders found' 
            });
        }

        const transformedOrders = orders.map(order => {
            const orderObj = order.toObject();
            return {
                _id: orderObj._id,
                userId: orderObj.userId,
                products: orderObj.products || [],
                totalPrice: orderObj.totalPrice,
                status: orderObj.status || 'Pending',
                date: orderObj.date || orderObj.createdAt,
                shippingAddress: orderObj.shippingAddress,
                paymentMethod: orderObj.paymentMethod
            };
        });

        res.status(200).json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not found' });
        }

        const orders = await orderModel.find({ userId })
            .populate('products.productId', 'name price image')
            .sort({ createdAt: -1 });
        
        // Transform the orders to include product details
        const transformedOrders = orders.map(order => ({
            ...order.toObject(),
            products: order.products.map(product => ({
                ...product,
                productId: product.productId?._id || product.productId,
                image: product.productId?.image?.[0] || null,
                name: product.productId?.name || product.name,
                price: product.productId?.price || product.price,
                quantity: product.quantity,
                size: product.size
            }))
        }));
        
        console.log('Transformed orders:', transformedOrders); // Debug log
        res.json({ success: true, orders: transformedOrders });
    } catch (error) {
        console.log("Get user orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId)
            .populate('user', 'name email')
            .populate('items.product', 'name price');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log("Get order details error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log("Update order status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export { placeOrderStripe, getAllOrders, getUserOrders, getOrderDetails, updateOrderStatus, placeOrder, verifyStripe };