const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantDetails,
  placeOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder
} = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/restaurants', getRestaurants);
router.get('/restaurants/:id', getRestaurantDetails);

// Gated customer routes
router.post('/orders', authenticate, authorize('customer'), placeOrder);
router.get('/orders/my', authenticate, authorize('customer'), getMyOrders);
router.get('/orders/:id', authenticate, authorize('customer'), getOrderDetails);
router.post('/orders/:id/cancel', authenticate, authorize('customer'), cancelOrder);

module.exports = router;
