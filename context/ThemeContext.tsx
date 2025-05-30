import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: any;
  themeMode: 'light' | 'dark';
  isDark: boolean;
  setThemeMode: (mode: 'light' | 'dark') => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('light');

  const setThemeMode = async (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((mode) => {
      if (mode) setThemeModeState(mode as 'light' | 'dark');
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: {},
        themeMode,
        isDark: themeMode === 'dark',
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
