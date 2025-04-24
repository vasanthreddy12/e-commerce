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
    const orders = await Order.find({ user: req.user.id })
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
      order.status = 'failed';
      await order.save();
      res.status(400).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 