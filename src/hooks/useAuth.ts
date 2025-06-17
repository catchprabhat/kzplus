import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('driveEasyUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        localStorage.removeItem('driveEasyUser');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem('driveEasyUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('driveEasyUser');
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  };

  const updateProfile = (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem('driveEasyUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  };

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile
  };
};