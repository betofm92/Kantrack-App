import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Appearance } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { createStyles, darkColors, lightColors, type AppStyles, type Palette, type ThemeMode } from './theme';

const preferenceKey = 'kantrack.ui.theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  styles: AppStyles;
  setMode: (next: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const lightStyles = createStyles(lightColors);
const darkStyles = createStyles(darkColors);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setCurrentMode] = useState<ThemeMode>(() => {
    try { return Storage.getItemSync(preferenceKey) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });

  useEffect(() => { Appearance.setColorScheme(mode); }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setCurrentMode(next);
    Appearance.setColorScheme(next);
    void Storage.setItem(preferenceKey, next).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    styles: mode === 'dark' ? darkStyles : lightStyles,
    setMode
  }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('ThemeProvider es requerido para la interfaz.');
  return theme;
}
