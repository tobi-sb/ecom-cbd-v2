import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Register a new user
export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Login a user
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Logout the current user
export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
  
  return true;
};

// Get the current session
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Update user profile
export const updateUserProfile = async (profile: { [key: string]: string | number | boolean | null }) => {
  const { data, error } = await supabase.auth.updateUser({
    data: profile
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Send password reset email
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Update user password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}; 