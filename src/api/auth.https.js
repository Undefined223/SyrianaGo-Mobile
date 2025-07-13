import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from './AxiosInstance';

export const loginUser = async (credentials) => {
  try {
    const res = await axiosInstance.post('/login', credentials);

    const token = res.data.token;
    const user = res.data.user;

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const registerUser = async (payload) => {
  try {
    const res = await axiosInstance.post('/register', payload);
    return res.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (err) {
    console.log('Logout error:', err);
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await AsyncStorage.getItem('userData');
    return JSON.parse(user);
  } catch (err) {
    return null;
  }
};
