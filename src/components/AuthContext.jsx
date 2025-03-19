import React, { createContext, useState, useEffect } from 'react';
import supabase from '../utils/supabase';  // Import Supabase client

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  // Signup with Supabase Auth
  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  // Login with Supabase Auth
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: error.message };
    }

    localStorage.setItem('token', data.session.access_token);
    setUser({ token: data.session.access_token });

    return { success: true };
  };

  // Logout from Supabase Auth
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
