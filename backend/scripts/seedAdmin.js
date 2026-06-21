const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodapp');
    console.log('MongoDB connected for seeding...');

    // Clear existing data (optional but ensures clean state)
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Dish.deleteMany();
    console.log('Cleared existing database entries.');

    // 1. Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@foodapp.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'superadmin',
      isActive: true
    });
    console.log('Created Super Admin: admin@foodapp.com / admin123');

    // 2. Create Customer
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@foodapp.com',
      password: 'customer123',
      phone: '9876543210',
      role: 'customer',
      isActive: true
    });
    console.log('Created Customer: customer@foodapp.com / customer123');

    // 3. Create Approved Restaurant Owner
    const owner1 = await User.create({
      name: 'Bella Owner',
      email: 'bella@foodapp.com',
      password: 'owner123',
      phone: '8888888888',
      role: 'restaurant',
      isActive: true
    });

    const restaurant1 = await Restaurant.create({
      name: 'Bella Italia',
      description: 'Authentic Italian trattoria serving stone-baked pizzas, homemade pastas, and artisanal gelato.',
      address: {
        street: '12 Vineyard Road',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107'
      },
      contactPhone: '4155551234',
      email: 'bella@foodapp.com',
      cuisineType: 'Italian',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      rating: 4.8,
      isActive: true, // Approved
      openingHours: '11:00 AM - 10:00 PM',
      createdBy: owner1._id
    });

    owner1.restaurantId = restaurant1._id;
    await owner1.save();
    console.log('Created Approved Restaurant Owner & Restaurant: bella@foodapp.com / owner123');

    // 4. Seed Dishes for Restaurant 1
    const dishes1 = [
      {
        restaurantId: restaurant1._id,
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, san marzano tomatoes, fresh basil, and extra virgin olive oil on our classic thin crust.',
        price: 14.99,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=800',
        isAvailable: true
      },
      {
        restaurantId: restaurant1._id,
        name: 'Truffle Mushroom Fettuccine',
        description: 'Creamy fettuccine pasta tossed with wild mushrooms, black truffle paste, and shaved parmesan.',
        price: 18.50,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800',
        isAvailable: true
      },
      {
        restaurantId: restaurant1._id,
        name: 'Garlic Parmesan Breadsticks',
        description: 'Warm breadsticks brushed with garlic butter, sprinkled with parmesan cheese, served with marinara dipping sauce.',
        price: 6.99,
        category: 'starter',
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800',
        isAvailable: true
      },
      {
        restaurantId: restaurant1._id,
        name: 'Tiramisu',
        description: 'Layers of espresso-soaked ladyfingers, rich mascarpone cream, and dark cocoa powder dusting.',
        price: 8.00,
        category: 'dessert',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
        isAvailable: true
      }
    ];
    await Dish.insertMany(dishes1);
    console.log('Seeded Bella Italia Menu Dishes.');

    // 5. Create Pending Restaurant Owner
    const owner2 = await User.create({
      name: 'Sakura Owner',
      email: 'sakura@foodapp.com',
      password: 'owner123',
      phone: '7777777777',
      role: 'restaurant',
      isActive: true
    });

    const restaurant2 = await Restaurant.create({
      name: 'Sakura Sushi',
      description: 'Traditional Japanese sushi lounge with hand-rolled maki, fresh sashimi, and hot ramen.',
      address: {
        street: '88 Cherry Blossom Lane',
        city: 'Seattle',
        state: 'WA',
        zip: '98101'
      },
      contactPhone: '2065558888',
      email: 'sakura@foodapp.com',
      cuisineType: 'Japanese',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
      rating: 0,
      isActive: false, // Pending approval
      openingHours: '12:00 PM - 09:30 PM',
      createdBy: owner2._id
    });

    owner2.restaurantId = restaurant2._id;
    await owner2.save();
    console.log('Created Pending Restaurant Owner & Restaurant (Requires Approval): sakura@foodapp.com / owner123');

    // 6. Seed Dishes for Restaurant 2
    const dishes2 = [
      {
        restaurantId: restaurant2._id,
        name: 'Signature Dragon Roll',
        description: 'Eel and cucumber inside, wrapped in sliced avocado and topped with sweet unagi sauce and sesame.',
        price: 15.99,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
        isAvailable: true
      },
      {
        restaurantId: restaurant2._id,
        name: 'Pork Chashu Tonkotsu Ramen',
        description: 'Rich, 12-hour pork bone broth, soft ramen noodles, tender pork belly chashu, soft-boiled egg, and green onion.',
        price: 16.50,
        category: 'main',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        isAvailable: true
      },
      {
        restaurantId: restaurant2._id,
        name: 'Edamame with Sea Salt',
        description: 'Steamed green soybeans in pod, sprinkled liberally with coarse sea salt.',
        price: 5.00,
        category: 'starter',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800',
        isAvailable: true
      }
    ];
    await Dish.insertMany(dishes2);
    console.log('Seeded Sakura Sushi Menu Dishes.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
