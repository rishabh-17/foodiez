const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Order = require('../models/Order');

// @desc    Get active restaurants (public)
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, sort } = req.query;
    let query = { isActive: true }; // Only show approved/active restaurants

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (cuisine) {
      query.cuisineType = { $regex: cuisine, $options: 'i' };
    }

    let apiQuery = Restaurant.find(query);

    // Sort by rating or newest
    if (sort === 'rating') {
      apiQuery = apiQuery.sort({ rating: -1 });
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const restaurants = await apiQuery;
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get restaurant details and its available dishes
// @route   GET /api/v1/restaurants/:id
// @access  Public
exports.getRestaurantDetails = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const dishes = await Dish.find({ restaurantId: restaurant._id, isAvailable: true });

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        dishes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Place an order
// @route   POST /api/v1/orders
// @access  Private/Customer
exports.placeOrder = async (req, res) => {
  const { restaurantId, items, deliveryAddress } = req.body;

  if (!restaurantId || !items || items.length === 0 || !deliveryAddress) {
    return res.status(400).json({
      success: false,
      message: 'Please provide restaurantId, items, and deliveryAddress'
    });
  }

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({ success: false, message: 'Restaurant not found or inactive' });
    }

    // Verify dishes and calculate totalAmount on server-side
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish) {
        return res.status(404).json({ success: false, message: `Dish with ID ${item.dishId} not found` });
      }
      if (dish.restaurantId.toString() !== restaurantId.toString()) {
        return res.status(400).json({
          success: false,
          message: `Dish '${dish.name}' does not belong to the selected restaurant`
        });
      }
      if (!dish.isAvailable) {
        return res.status(400).json({ success: false, message: `Dish '${dish.name}' is currently unavailable` });
      }

      const itemTotal = dish.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        dishId: dish._id,
        quantity: item.quantity,
        price: dish.price // Store historical price at ordering time
      });
    }

    const order = await Order.create({
      customerId: req.user._id,
      restaurantId,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
      status: 'placed'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's order history
// @route   GET /api/v1/orders/my
// @access  Private/Customer
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id })
      .populate('restaurantId', 'name image cuisineType address')
      .populate('items.dishId', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/v1/orders/:id
// @access  Private/Customer
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name contactPhone address image')
      .populate('items.dishId', 'name price image category')
      .populate('customerId', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure this order belongs to the requester
    if (order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   POST /api/v1/orders/:id/cancel
// @access  Private/Customer
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure order belongs to customer
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Check status eligibility (can only cancel if in 'placed' status)
    if (order.status !== 'placed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
