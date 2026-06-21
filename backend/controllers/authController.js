const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supervioletsecret123', {
    expiresIn: '30d'
  });
};

// @desc    Register a customer or restaurant owner
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password, phone, role, restaurantName, restaurantDescription, restaurantAddress, restaurantPhone, restaurantCuisine } = req.body;

  try {
    // Check if user already exists
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Assign role (default to customer if invalid or omitted)
    const finalRole = ['customer', 'restaurant'].includes(role) ? role : 'customer';

    if (finalRole === 'restaurant') {
      if (!restaurantName || !restaurantAddress || !restaurantPhone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all restaurant details (name, address, contact phone)'
        });
      }

      // Create restaurant owner user (pending status is on the Restaurant itself)
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'restaurant',
        isActive: true // User account is active, but the restaurant itself is pending approval
      });

      // Address needs parsing if sent as object, or handle standard fields
      let addr = {};
      if (typeof restaurantAddress === 'object') {
        addr = restaurantAddress;
      } else {
        addr = {
          street: restaurantAddress,
          city: 'City',
          state: 'State',
          zip: '000000'
        };
      }

      // Create Restaurant
      const restaurant = await Restaurant.create({
        name: restaurantName,
        description: restaurantDescription || 'No description provided',
        address: addr,
        contactPhone: restaurantPhone,
        email: email, // Default restaurant email to owner's email
        cuisineType: restaurantCuisine || 'General',
        createdBy: user._id,
        isActive: false // Pending approval
      });

      // Update User with restaurant reference
      user.restaurantId = restaurant._id;
      await user.save();

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          restaurantId: restaurant._id
        }
      });

    } else {
      // Create Customer
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'customer',
        isActive: true
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        restaurantId: user.restaurantId
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('restaurantId');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        restaurantId: user.restaurantId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
