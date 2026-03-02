/**
 * Universal Theme Provider - Native Implementation
 *
 * This provider handles theme state on React Native using NativeWind's
 * colorScheme utilities and AsyncStorage for persistence.
 */

import * as React from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark" | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "aegis-theme",
}: ThemeProviderProps) => {
  const deviceColorScheme = useDeviceColorScheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? deviceColorScheme ?? "light" : theme;

  // Initialize theme from storage
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
          setThemeState(stored as Theme);
          const resolved = stored === "system" 
            ? (deviceColorScheme ?? "light") 
            : stored;
          setColorScheme(resolved as "light" | "dark");
        } else {
          const resolved = defaultTheme === "system" 
            ? (deviceColorScheme ?? "light") 
            : defaultTheme;
          setColorScheme(resolved as "light" | "dark");
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, [defaultTheme, storageKey, deviceColorScheme, setColorScheme]);

  // Update NativeWind when theme changes
  React.useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme, setColorScheme]);

  const setTheme = React.useCallback(
    async (next: Theme) => {
      setThemeState(next);

      const resolved = next === "system" 
        ? (deviceColorScheme ?? "light") 
        : next;
      setColorScheme(resolved as "light" | "dark");

      try {
        await AsyncStorage.setItem(storageKey, next);
      } catch (error) {
        console.error("Failed to save theme:", error);
      }
    },
    [storageKey, deviceColorScheme, setColorScheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export { ThemeProvider, useTheme, ThemeContext };







