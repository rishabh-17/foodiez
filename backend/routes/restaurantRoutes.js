const express = require('express');
const router = express.Router();
const {
  getMyRestaurant,
  updateMyRestaurant,
  getMyDishes,
  addMyDish,
  updateMyDish,
  deleteMyDish,
  getMyOrders,
  updateOrderStatus
} = require('../controllers/restaurantController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes under this router to restaurant owner role only
router.use(authenticate);
router.use(authorize('restaurant'));

router.route('/my-restaurant')
  .get(getMyRestaurant)
  .put(updateMyRestaurant);

router.route('/dishes')
  .get(getMyDishes)
  .post(addMyDish);

router.route('/dishes/:id')
  .put(updateMyDish)
  .delete(deleteMyDish);

router.get('/orders', getMyOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
