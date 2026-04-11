import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {}, setTheme: () => {}, syncUser: () => {} });

const STORAGE_KEY_PREFIX = 'eduapps-theme';

// Siempre light por defecto — la preferencia solo se carga si hay usuario
const getInitialTheme = () => 'light';

// Helpers para leer/guardar la preferencia por usuario
const getUserThemeKey = (userId) => `${STORAGE_KEY_PREFIX}-${userId}`;

const loadUserTheme = (userId) => {
  if (!userId) return null;
  try {
    const stored = window.localStorage.getItem(getUserThemeKey(userId));
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return null;
};

const saveUserTheme = (userId, theme) => {
  if (!userId) return;
  try {
    window.localStorage.setItem(getUserThemeKey(userId), theme);
  } catch {}
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitialTheme);
  const currentUserIdRef = useRef(null);

  // Aplicar clase dark al DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Guardar preferencia del usuario actual (si hay uno)
    saveUserTheme(currentUserIdRef.current, theme);
  }, [theme]);

  const setTheme = useCallback((value) => {
    setThemeState(value === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // Llamado desde dentro del árbol auth cuando el usuario cambia
  const syncUser = useCallback((userId) => {
    currentUserIdRef.current = userId || null;
    if (userId) {
      // Usuario logueado → cargar su preferencia guardada (o mantener light)
      const saved = loadUserTheme(userId);
      if (saved) setThemeState(saved);
    } else {
      // Sin usuario → volver a light
      setThemeState('light');
    }
  }, []);

  return (
    <ThemeContext.Provider value={useMemo(() => ({ theme, toggleTheme, setTheme, syncUser }), [theme, toggleTheme, setTheme, syncUser])}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
