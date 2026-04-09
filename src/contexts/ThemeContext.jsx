import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, setTheme: () => {} });

const STORAGE_KEY = 'eduapps-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {}
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = useCallback((value) => {
    setThemeState(value === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
