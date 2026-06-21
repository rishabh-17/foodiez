import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Store, Phone, User, MapPin, Compass, AlertCircle, Sparkles } from 'lucide-react';

const RestaurantLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDesc, setRestaurantDesc] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');

  const [formError, setFormError] = useState('');
  const { login, register, isAuthenticated, user, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'restaurant') {
      navigate('/restaurant/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (isLogin) {
      if (!email || !password) {
        setFormError('Please enter both email and password.');
        return;
      }
      try {
        const loggedUser = await login(email, password);
        if (loggedUser.role === 'restaurant') {
          navigate('/restaurant/dashboard');
        } else {
          setFormError('Access Denied. You are not registered as a Restaurant Owner.');
        }
      } catch (err) {
        setFormError(err.message || 'Login failed.');
      }
    } else {
      // Validate Registration
      if (!name || !email || !password || !phone || !restaurantName || !street || !city || !state || !zip || !restaurantPhone || !cuisine) {
        setFormError('Please fill out all required registration fields.');
        return;
      }

      const registerData = {
        name,
        email,
        password,
        phone,
        role: 'restaurant',
        restaurantName,
        restaurantDescription: restaurantDesc,
        restaurantAddress: {
          street,
          city,
          state,
          zip
        },
        restaurantPhone,
        restaurantCuisine: cuisine
      };

      try {
        await register(registerData);
        navigate('/restaurant/dashboard');
      } catch (err) {
        setFormError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-primary-light to-white p-5 py-10">
      <div 
        className={`bg-white rounded-custom-lg p-10 border border-border-color shadow-custom-lg w-full transition-all duration-300 ${
          isLogin ? 'max-w-md' : 'max-w-3xl'
        }`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={32} className="text-primary" />
            <span className="text-3xl font-extrabold text-text-dark">VibeBite</span>
          </div>
          <h3 className="text-lg font-bold text-text-dark">Restaurant Partner Portal</h3>
          <p className="text-text-muted text-xs mt-1">
            {isLogin ? 'Sign in to access your culinary dashboard.' : 'Partner with us and reach thousands of customers.'}
          </p>
        </div>

        {/* Tab Header */}
        <div className="flex bg-primary-light p-1.5 rounded-custom-md mb-6">
          <div 
            className={`flex-1 py-2 text-center font-bold text-sm rounded-custom-md cursor-pointer transition-all ${
              isLogin ? 'bg-primary text-white shadow-sm' : 'text-primary hover:bg-white/50'
            }`} 
            onClick={() => { setIsLogin(true); setFormError(''); }}
          >
            Partner Login
          </div>
          <div 
            className={`flex-1 py-2 text-center font-bold text-sm rounded-custom-md cursor-pointer transition-all ${
              !isLogin ? 'bg-primary text-white shadow-sm' : 'text-primary hover:bg-white/50'
            }`} 
            onClick={() => { setIsLogin(false); setFormError(''); }}
          >
            Register Restaurant
          </div>
        </div>

        {(formError || error) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-custom-md mb-5 text-sm font-semibold border border-red-100">
            <AlertCircle size={18} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            // Login Fields
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-text-dark">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="owner@bellaitalia.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text-dark">Password</label>
                <div className="relative">
                  <Lock size={18} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-3 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            // Registration Fields Grid (split into owner & restaurant info)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Owner Profile Section */}
              <div className="flex flex-col gap-4">
                <h4 className="border-b border-border-color pb-2 font-bold text-primary">1. Owner Account Details</h4>
                
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Full Name</label>
                  <div className="relative">
                    <User size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="Bella Owner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Contact Email</label>
                  <div className="relative">
                    <Mail size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="owner@bellaitalia.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Create Password</label>
                  <div className="relative">
                    <Lock size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Owner Phone</label>
                  <div className="relative">
                    <Phone size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="8888888888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant Details Section */}
              <div className="flex flex-col gap-4">
                <h4 className="border-b border-border-color pb-2 font-bold text-primary">2. Restaurant Information</h4>
                
                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Restaurant Name</label>
                  <div className="relative">
                    <Store size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="Bella Italia"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Cuisine Type</label>
                  <div className="relative">
                    <Compass size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="Italian, Fast Food"
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Restaurant Phone</label>
                  <div className="relative">
                    <Phone size={16} className="text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="4155551234"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-text-dark">Brief Description</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="Stone-baked pizza & homemade pasta"
                    value={restaurantDesc}
                    onChange={(e) => setRestaurantDesc(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-text-dark">Street Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="12 Vineyard Rd"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-text-dark">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="SF"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-text-dark">State</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="CA"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-text-dark">Zip Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 text-sm rounded-custom-md border border-border-color bg-white text-text-dark outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary-light"
                      placeholder="94107"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-primary text-white rounded-custom-md font-bold text-sm transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 cursor-pointer mt-6"
          >
            {isLogin ? 'Sign In' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantLoginPage;
