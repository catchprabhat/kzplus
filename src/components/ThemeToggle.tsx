import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300 ease-in-out
        ${isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>
    </button>
  );
};