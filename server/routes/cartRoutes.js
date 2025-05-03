const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  restoreCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
router.get('/', protect, getCart);

// @route   POST /api/cart
router.post(
  '/',
  [
    protect,
    [
      check('productId', 'Product ID is required').not().isEmpty(),
      check('quantity', 'Quantity must be a positive number').isInt({ min: 1 })
    ]
  ],
  addToCart
);

// @route   PUT /api/cart/:productId
router.put(
  '/:productId',
  [
    protect,
    [
      check('quantity', 'Quantity must be a positive number').isInt({ min: 1 })
    ]
  ],
  updateCartItem
);

// @route   DELETE /api/cart/:productId
router.delete('/:productId', protect, removeFromCart);

// @route   DELETE /api/cart
router.delete('/', protect, clearCart);

// @route   POST /api/cart/restore
router.post(
  '/restore',
  [
    protect,
    [
      check('orderId', 'Order ID is required').not().isEmpty()
    ]
  ],
  restoreCart
);

module.exports = router; 