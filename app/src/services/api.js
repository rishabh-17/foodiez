import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In React Native, localhost points to the device itself.
// 10.0.2.2 is the bridge IP for Android Emulators to reach the host's localhost.
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:5001/api/v1' 
  : 'http://127.0.0.1:5001/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('AsyncStorage error in request interceptor:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
