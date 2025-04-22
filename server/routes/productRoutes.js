const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/products
router.get('/', getProducts);

// @route   GET /api/products/:id
router.get('/:id', getProduct);

// @route   POST /api/products
router.post(
  '/',
  [
    protect,
    admin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price must be a positive number').isFloat({ min: 0 }),
      check('category', 'Category is required').not().isEmpty(),
      check('image', 'Image URL is required').not().isEmpty(),
      check('stock', 'Stock must be a positive number').isInt({ min: 0 })
    ]
  ],
  createProduct
);

// @route   PUT /api/products/:id
router.put(
  '/:id',
  [
    protect,
    admin,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
      check('category', 'Category is required').optional().not().isEmpty(),
      check('image', 'Image URL is required').optional().not().isEmpty(),
      check('stock', 'Stock must be a positive number').optional().isInt({ min: 0 })
    ]
  ],
  updateProduct
);

// @route   DELETE /api/products/:id
router.delete('/:id', [protect, admin], deleteProduct);

module.exports = router; 