const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Use the pre-calculated values from cart
    const subtotal = cart.subtotal;
    const shipping = cart.shipping;
    const tax = cart.tax;
    const total = cart.total;

    // Create order in database
    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      status: 'processing',
      isPaid: false
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Update product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      await product.save();
    }

    if (order.paymentMethod === 'online') {
      console.log(total,"total");
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // amount in paise
        currency: 'INR',
        receipt: order._id.toString(),
      });

      // Update order with Razorpay order ID
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.status(201).json({
        success: true,
        order: {
          ...order.toObject(),
          razorpayOrderId: razorpayOrder.id
        }
      });
    } else {
      order.status = 'processing';
      res.status(201).json({ success: true, order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name image _id'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name image'
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if(status === 'cancelled'){
      order.isCancelled = true;
      order.cancelledAt = Date.now();
      
      // Restore product quantities
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        product.stock += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify signature
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature === signature) {
      order.status = 'processing';
      order.paymentResult = {
        id: paymentId,
        status: 'completed',
        update_time: Date.now(),
      };
      order.isPaid = true;
      order.paidAt = Date.now();
      await order.save();

      // Clear the user's cart
      await Cart.findOneAndUpdate(
        { user: req.user.id },
        { $set: { items: [] } }
      );

      res.json({ success: true });
    } else {
      // Payment failed - update order status and restore product quantities
      order.status = 'cancelled';
      order.paymentResult = {
        id: paymentId,
        status: 'failed',
        update_time: Date.now(),
        error: 'Invalid signature'
      };
      order.cancelledAt = Date.now();
      await order.save();

      // Restore product quantities
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      res.status(400).json({ 
        success: false,
        message: 'Payment verification failed',
        error: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    // If order exists, update its status and restore quantities
    if (req.body.orderId) {
      const order = await Order.findOne({ razorpayOrderId: req.body.orderId });
      if (order) {
        order.status = 'cancelled';
        order.paymentResult = {
          status: 'failed',
          update_time: Date.now(),
          error: error.message
        };
        order.cancelledAt = Date.now();
        await order.save();

        // Restore product quantities
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      }
    }
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed',
      error: error.message 
    });
  }
};

// @desc    Handle payment cancellation
// @route   POST /api/orders/cancel-payment
// @access  Private
exports.cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ 
        success: false,
        message: 'Order ID is required' 
      });
    }

    const order = await Order.findOne({ razorpayOrderId: orderId });
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.json({ 
        success: true,
        message: 'Order is already cancelled',
        order
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.paymentResult = {
      status: 'cancelled',
      update_time: Date.now(),
      error: 'Payment cancelled by user'
    };
    order.cancelledAt = Date.now();

    try {
      // Restore product quantities
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      await order.save();
      
      res.json({ 
        success: true,
        message: 'Payment cancelled and order updated',
        order
      });
    } catch (saveError) {
      console.error('Error saving order or updating products:', saveError);
      // If we fail to save, try to rollback any product updates
      try {
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock -= item.quantity; // Revert the stock update
            await product.save();
          }
        }
      } catch (rollbackError) {
        console.error('Error rolling back product updates:', rollbackError);
      }
      
      throw saveError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel payment',
      error: error.message 
    });
  }
}; 