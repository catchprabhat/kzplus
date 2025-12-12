
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  token?: string; // Add token field
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('driveEasyUser');
        const savedToken = localStorage.getItem('driveEasyToken');
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser({ ...userData, token: savedToken });
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        localStorage.removeItem('driveEasyUser');
        localStorage.removeItem('driveEasyToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // React to storage changes (e.g., token cleared/expired elsewhere)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'driveEasyToken' || e.key === 'driveEasyUser') {
        try {
          const savedUser = localStorage.getItem('driveEasyUser');
          const savedToken = localStorage.getItem('driveEasyToken');
          if (savedUser && savedToken) {
            const userData = JSON.parse(savedUser);
            setUser({ ...userData, token: savedToken });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (userData: User) => {
    try {
      setUser(userData);
      localStorage.setItem('driveEasyUser', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('driveEasyToken', userData.token);
      }
      
      // Set loading state and navigate to home page
      setLoading(true);
      
      // Small delay to show loading, then reload to fetch fresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000); // 1000ms delay to show loading state
      
    } catch (error) {
      console.error('Failed to save user session:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('driveEasyUser');
      localStorage.removeItem('driveEasyToken');
      
      // Reload the page after logout
      window.location.reload();
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

  const getAuthToken = () => {
    return user?.token || localStorage.getItem('driveEasyToken');
  };

  // Consider token presence for authentication, not just user object
  const isAuthenticated = !!(user && (user.token || localStorage.getItem('driveEasyToken')));

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    getAuthToken
  };
};
