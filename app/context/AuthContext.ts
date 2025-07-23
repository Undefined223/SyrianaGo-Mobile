import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, loginUser, logoutUser } from '@/api/https/auth.https';

export interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setUserToken: (token: string | null) => void;
  wishlist: Array<{ _id: string; images: string[]; name: { en: string }; pricePerDay: number }>;
  setWishlist: (wishlist: Array<{ _id: string; images: string[]; name: { en: string }; pricePerDay: number }>) => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

