// TrustKey Theme Context

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { userPreferencesManager } from '../utils/storage';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'auto',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const savedTheme = userPreferencesManager.getTheme();
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else if (theme === 'auto') {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(shouldBeDark);

      // Apply theme to document
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Set theme and save to storage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    userPreferencesManager.setTheme(newTheme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // If auto, toggle to the opposite of current system preference
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemIsDark ? 'light' : 'dark');
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
