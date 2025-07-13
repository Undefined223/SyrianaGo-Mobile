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

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const { token, user } = await loginUser(credentials);
      setUserToken(token);
      setUser(user);
    } catch (error) {
      throw error; // Let screen handle error alert
    }
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
    setUserToken(null);
  };

  const restoreSession = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const user = await getCurrentUser();
      if (token && user) {
        setUserToken(token);
        setUser(user);
      }
    } catch (err) {
      console.log('Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        userToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
