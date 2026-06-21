const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Order = require('../models/Order');

// Helper to get owner's restaurant
const getOwnerRestaurant = async (userId) => {
  return await Restaurant.findOne({ createdBy: userId });
};

// @desc    Get owner's restaurant details
// @route   GET /api/v1/restaurant/my-restaurant
// @access  Private/RestaurantOwner
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update owner's restaurant details
// @route   PUT /api/v1/restaurant/my-restaurant
// @access  Private/RestaurantOwner
exports.updateMyRestaurant = async (req, res) => {
  try {
    let restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    const updateData = { ...req.body };
    // Handle address parameters if sent flat
    if (req.body.street || req.body.city || req.body.state || req.body.zip) {
      updateData.address = {
        street: req.body.street || restaurant.address.street,
        city: req.body.city || restaurant.address.city,
        state: req.body.state || restaurant.address.state,
        zip: req.body.zip || restaurant.address.zip
      };
    }

    // Do not allow updating rating, createdBy, or approval status directly via this endpoint
    delete updateData.rating;
    delete updateData.createdBy;
    delete updateData.isActive;

    restaurant = await Restaurant.findByIdAndUpdate(restaurant._id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dishes for the owner's restaurant
// @route   GET /api/v1/restaurant/dishes
// @access  Private/RestaurantOwner
exports.getMyDishes = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    const dishes = await Dish.find({ restaurantId: restaurant._id });
    res.status(200).json({ success: true, count: dishes.length, data: dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a dish to the owner's restaurant
// @route   POST /api/v1/restaurant/dishes
// @access  Private/RestaurantOwner
exports.addMyDish = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    const dish = await Dish.create({
      ...req.body,
      restaurantId: restaurant._id
    });

    res.status(201).json({ success: true, data: dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a dish in the owner's restaurant
// @route   PUT /api/v1/restaurant/dishes/:id
// @access  Private/RestaurantOwner
exports.updateMyDish = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    let dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    // Ensure the dish belongs to the owner's restaurant
    if (dish.restaurantId.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this dish' });
    }

    dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a dish from the owner's restaurant
// @route   DELETE /api/v1/restaurant/dishes/:id
// @access  Private/RestaurantOwner
exports.deleteMyDish = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    // Ensure the dish belongs to the owner's restaurant
    if (dish.restaurantId.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this dish' });
    }

    await Dish.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for the owner's restaurant
// @route   GET /api/v1/restaurant/orders
// @access  Private/RestaurantOwner
exports.getMyOrders = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    const orders = await Order.find({ restaurantId: restaurant._id })
      .populate('customerId', 'name email phone')
      .populate('items.dishId', 'name price category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status of an order
// @route   PUT /api/v1/restaurant/orders/:id/status
// @access  Private/RestaurantOwner
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  const validStatuses = ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'No restaurant found for this owner' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure the order belongs to the owner's restaurant
    if (order.restaurantId.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order status updated to ${status}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
