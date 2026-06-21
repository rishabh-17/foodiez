const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  approveRestaurant,
  deactivateRestaurant,
  getRestaurantDishes,
  addDish,
  updateDish,
  deleteDish,
  getOrders
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes under this router to superadmin role only
router.use(authenticate);
router.use(authorize('superadmin'));

router.route('/restaurants')
  .get(getRestaurants)
  .post(createRestaurant);

router.route('/restaurants/:id')
  .put(updateRestaurant)
  .delete(deactivateRestaurant);

router.put('/restaurants/:id/approve', approveRestaurant);

router.route('/restaurants/:id/dishes')
  .get(getRestaurantDishes)
  .post(addDish);

router.route('/dishes/:id')
  .put(updateDish)
  .delete(deleteDish);

router.get('/orders', getOrders);

module.exports = router;
