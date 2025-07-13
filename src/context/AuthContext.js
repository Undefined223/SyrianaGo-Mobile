import React, { createContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, getCurrentUser } from '../api/auth.https';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const { token, user } = await loginUser(credentials);
      setUserToken(token);
      setUser(user);
    } catch (error) {
      throw error; // Let screen handle error alert
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setUserToken(null);
  };

  const restoreSession = async () => {
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
