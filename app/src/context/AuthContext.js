import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Load auth state from storage on start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        const storedCart = await AsyncStorage.getItem('cart');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (e) {
        console.error('Failed to restore auth credentials:', e);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Sync cart to storage when it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to sync cart:', e);
      }
    };
    saveCart();
  }, [cart]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        if (userData.role !== 'customer') {
          throw new Error('Access Denied. Only customer accounts can sign in on the app.');
        }

        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone,
        role: 'customer'
      });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('cart');
      setToken(null);
      setUser(null);
      setCart([]);
    } catch (e) {
      console.error(e);
    }
  };

  // Cart Operations
  const addToCart = (dish, restaurantId) => {
    // Check if cart contains items from a different restaurant
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      throw new Error('RESTAURANT_CONFLICT');
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.dishId === dish._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.dishId === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          dishId: dish._id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          restaurantId,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (dishId) => {
    setCart((prevCart) => prevCart.filter((item) => item.dishId !== dishId));
  };

  const updateCartQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.dishId === dishId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cart,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
