import React, { useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, loginUser, logoutUser } from '@/api/https/auth.https';
import { AuthContext, User, LoginCredentials } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<any[]>([]);

  const login = async (credentials: LoginCredentials): Promise<any> => {
    try {
      const data = await loginUser(credentials);

      if (data.accessToken) {
        console.log('Received userToken:', data.accessToken);
        try {
          console.log('Attempting to save userToken to AsyncStorage:', data.accessToken);
          setUserToken(data.accessToken);
          await AsyncStorage.setItem('userToken', data.accessToken);
          console.log('Successfully saved userToken to AsyncStorage');
        } catch (error) {
          console.error('Failed to save userToken to AsyncStorage:', error);
        }
      }

      if (data.user) {
        try {
          console.log('Saving userData to AsyncStorage:', data.user);
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          setUser(data.user);
        } catch (error) {
          console.error('Failed to save userData to AsyncStorage:', error);
        }
      }

      return data; // Return the full response to handle `twoFactorRequired`
    } catch (error) {
      throw error; // Let the screen handle the error
    }
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
    setUserToken(null);
  };

  const restoreSession = async (): Promise<void> => {
    try {
      console.log('Restoring session...');
      const token = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (token && storedUser) {
        console.log('Session found:', { token, user: JSON.parse(storedUser) });
        setUserToken(token);
        setUser(JSON.parse(storedUser));
      } else {
        console.log('No session found');
      }
    } catch (err) {
      console.log('Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logAsyncStorage = async (): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage contents:', stores);
    } catch (err) {
      console.log('Failed to log AsyncStorage contents:', err);
    }
  };

  useEffect(() => {
    logAsyncStorage();
    restoreSession();
  }, []);

  if (isLoading) {
    return null; // Prevent rendering until session is restored
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        userToken,
        setUserToken,
        isLoading,
        setUser,
        wishlist,
        setWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};