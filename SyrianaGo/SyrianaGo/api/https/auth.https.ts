import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../AxiosInstance';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // Added avatar property
  // Add other user properties as needed
}

export const loginUser = async (
  credentials: LoginCredentials
): Promise<{ token: string; user: User }> => {
  try {
    console.log('Login request:', credentials);
    const res = await axiosInstance.post('/auth/login', credentials);

    console.log('Login response:', res.data);
    const token = res.data.accessToken; // Corrected property name
    const user = res.data.user;

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    return { token, user };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error);
    throw error.response?.data?.message || 'Login failed';
  }
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<User> => {
  try {
    const res = await axiosInstance.post('/auth/register', payload);
    return res.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (err) {
    console.log('Logout error:', err);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem('userData');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    return null;
  }
};

const getUserRecentActivities = async (userId, lang = 'en') => {
  const res = await axiosInstance.get(`/auth/${userId}/recent-activities?lang=${lang}`);
  return res.data;
};

export const logAsyncStorageData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    console.log('AsyncStorage data:', data);
  } catch (error) {
    console.error('Error logging AsyncStorage data:', error);
  }
};


export const updateUser = async (data: {
  name: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
}): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Update token:', token);
    console.log('Update payload:', data);
    const res = await axiosInstance.put('/auth/me', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Update response:', res.data);

    // Save updated user data in AsyncStorage
    await AsyncStorage.setItem('userData', JSON.stringify(res.data));

    return res.data;
  } catch (error: unknown) {
    console.error('Update error:', error);
    if (error instanceof Error) {
      throw error.message;
    }
    throw 'Update failed';
  }
};

const refreshToken = async () => {
  try {
    const response = await axiosInstance.post(`/auth/refresh-token`);
    const accessToken = response.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    return accessToken;
  } catch (error) {
    throw error.response?.data || error;
  }
};



// Google OAuth login redirect (front-end initiates)

const loginWithGoogle = () => {
  if (typeof window !== "undefined") {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }
};

export const addToWishlist = async (listingId: string): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axiosInstance.post(`/auth/wishlist/${listingId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error.response?.data?.message || 'Failed to add to wishlist';
  }
};

export const getWishlist = async (): Promise<any[]> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axiosInstance.get(`/auth/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error.response?.data?.message || 'Failed to fetch wishlist';
  }
};

export const removeFromWishlist = async (listingId: string): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axiosInstance.delete(`/auth/wishlist/${listingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error.response?.data?.message || 'Failed to remove from wishlist';
  }
};

// 2FA
const verify2FA = async ({ email, code }: { email: string; code: string }): Promise<any> => {
  const res = await axiosInstance.post(`/auth/2fa`, { email, code });
  return res.data;
};

const toggle2FA = async () => {
  const res = await axiosInstance.post(`/auth/toggle-2fa`);
  return res.data;
};

// Get user bookings
export const getUserBookings = async (): Promise<any[]> => {
  const res = await axiosInstance.get(`/auth/bookings`);
  return res.data;
};
// Google Callback – typically handled server-side; not used directly in client-side code

