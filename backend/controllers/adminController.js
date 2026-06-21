const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Dish = require('../models/Dish');
const Order = require('../models/Order');

// @desc    Get all restaurants
// @route   GET /api/v1/admin/restaurants
// @access  Private/Superadmin
exports.getRestaurants = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const restaurants = await Restaurant.find(query).populate('createdBy', 'name email phone');
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a restaurant (and its owner user if needed)
// @route   POST /api/v1/admin/restaurants
// @access  Private/Superadmin
exports.createRestaurant = async (req, res) => {
  const {
    name, description, street, city, state, zip, contactPhone, email, cuisineType, image, openingHours,
    ownerName, ownerEmail, ownerPassword, ownerPhone
  } = req.body;

  try {
    // Check if owner email exists
    let owner = await User.findOne({ email: ownerEmail });
    
    if (!owner) {
      // Create new owner
      if (!ownerPassword) {
        return res.status(400).json({ success: false, message: 'Please provide password for the new owner user' });
      }
      owner = await User.create({
        name: ownerName || 'Restaurant Owner',
        email: ownerEmail,
        password: ownerPassword,
        phone: ownerPhone || contactPhone,
        role: 'restaurant',
        isActive: true
      });
    } else {
      // Verify owner is restaurant role and doesn't already own a restaurant
      if (owner.role !== 'restaurant') {
        return res.status(400).json({ success: false, message: 'Existing user is not a restaurant owner' });
      }
      if (owner.restaurantId) {
        return res.status(400).json({ success: false, message: 'This owner already has a restaurant assigned' });
      }
    }

    const address = { street, city, state, zip };

    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      contactPhone,
      email,
      cuisineType,
      image,
      openingHours,
      createdBy: owner._id,
      isActive: true // Superadmin created restaurants can be active by default
    });

    // Link restaurant to owner
    owner.restaurantId = restaurant._id;
    await owner.save();

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/v1/admin/restaurants/:id
// @access  Private/Superadmin
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Handle nested address properties if sent flat
    const updateData = { ...req.body };
    if (req.body.street || req.body.city || req.body.state || req.body.zip) {
      updateData.address = {
        street: req.body.street || restaurant.address.street,
        city: req.body.city || restaurant.address.city,
        state: req.body.state || restaurant.address.state,
        zip: req.body.zip || restaurant.address.zip
      };
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Activate restaurant owner
// @route   PUT /api/v1/admin/restaurants/:id/approve
// @access  Private/Superadmin
exports.approveRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isActive = true;
    await restaurant.save();

    res.status(200).json({ success: true, message: 'Restaurant approved successfully', data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate restaurant (Soft delete)
// @route   DELETE /api/v1/admin/restaurants/:id
// @access  Private/Superadmin
exports.deactivateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.isActive = false;
    await restaurant.save();

    res.status(200).json({ success: true, message: 'Restaurant deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dishes for a restaurant
// @route   GET /api/v1/admin/restaurants/:id/dishes
// @access  Private/Superadmin
exports.getRestaurantDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ restaurantId: req.params.id });
    res.status(200).json({ success: true, count: dishes.length, data: dishes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add dish to a restaurant
// @route   POST /api/v1/admin/restaurants/:id/dishes
// @access  Private/Superadmin
exports.addDish = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const dish = await Dish.create({
      ...req.body,
      restaurantId: req.params.id
    });

    res.status(201).json({ success: true, data: dish });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dish details
// @route   PUT /api/v1/admin/dishes/:id
// @access  Private/Superadmin
exports.updateDish = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
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

// @desc    Delete dish
// @route   DELETE /api/v1/admin/dishes/:id
// @access  Private/Superadmin
exports.deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    await Dish.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders on the platform
// @route   GET /api/v1/admin/orders
// @access  Private/Superadmin
exports.getOrders = async (req, res) => {
  try {
    const { status, restaurantId } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('restaurantId', 'name address')
      .populate('items.dishId', 'name price category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
