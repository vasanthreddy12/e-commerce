const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  verifyPayment
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/orders
router.post(
  '/',
  [
    protect,
    [
      check('shippingAddress.address', 'address is required').not().isEmpty(),
      check('shippingAddress.city', 'City is required').not().isEmpty(),
      check('shippingAddress.postalCode', 'Postal code is required').not().isEmpty(),
      check('shippingAddress.country', 'Country is required').not().isEmpty()
    ]
  ],
  createOrder
);

// @route   GET /api/orders/myorders
router.get('/myorders', protect, getMyOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, getOrderById);

// @route   GET /api/orders
router.get('/', [protect, admin], getOrders);

// @route   PUT /api/orders/:id/status
router.put(
  '/:id/status',
  [
    protect,
    admin,
    [
      check('status', 'Status is required').isIn([
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ])
    ]
  ],
  updateOrderStatus
);

// @route   POST /api/orders/:id/verify
router.post(
  '/:id/verify',
  [
    protect,
    [
      check('razorpay_payment_id', 'Payment ID is required').not().isEmpty(),
      check('razorpay_order_id', 'Order ID is required').not().isEmpty(),
      check('razorpay_signature', 'Signature is required').not().isEmpty()
    ]
  ],
  verifyPayment
);

// @route   POST /api/orders/verify-payment
router.post('/verify-payment', protect, verifyPayment);

module.exports = router; 