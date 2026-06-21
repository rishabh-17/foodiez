const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  address: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    zip: { type: String, required: [true, 'Zip/postal code is required'] }
  },
  contactPhone: {
    type: String,
    required: [true, 'Please add a contact phone number']
  },
  email: {
    type: String,
    required: [true, 'Please add a contact email'],
    lowercase: true,
    trim: true
  },
  cuisineType: {
    type: String,
    required: [true, 'Please specify cuisine type'],
    trim: true
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false // Pending approval by Super Admin
  },
  openingHours: {
    type: String,
    default: '09:00 AM - 10:00 PM'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One restaurant per owner
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
