'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/services/auth.service';
import { isAdminEmail } from '@/config/admins';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Function to check if user is admin based on email
  const checkIsAdmin = (user: User | null) => {
    if (!user) return false;
    return isAdminEmail(user.email);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        setIsAdmin(checkIsAdmin(currentUser));
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          setIsAuthenticated(!!session?.user);
          setIsAdmin(checkIsAdmin(session?.user || null));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    );

    fetchUser();

    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      const { user } = await loginUser(email, password);
      setUser(user);
      setIsAuthenticated(!!user);
      setIsAdmin(checkIsAdmin(user));
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<User | null> => {
    try {
      setLoading(true);
      const { user } = await registerUser(email, password);
      setUser(user);
      setIsAuthenticated(!!user);
      setIsAdmin(checkIsAdmin(user));
      return user;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 