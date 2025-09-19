import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark'); // Changed from 'light' to 'dark'

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('driveEasyTheme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to dark theme for first-time visitors
      setTheme('dark'); // Changed from system preference check to always default to dark
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('driveEasyTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
};