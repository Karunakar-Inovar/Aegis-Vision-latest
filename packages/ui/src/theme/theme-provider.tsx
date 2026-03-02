/**
 * Universal Theme Provider - Web Implementation
 *
 * This provider handles theme state and applies the theme via CSS class on web.
 * The native version uses NativeWind's colorScheme utilities.
 */

import * as React from "react";

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

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "aegis-theme",
}: ThemeProviderProps) => {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    "light"
  );

  // Initialize theme from storage
  React.useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(storageKey) as Theme | null)
        : null;

    const initialTheme = stored || defaultTheme;
    setThemeState(initialTheme);

    const resolved =
      initialTheme === "system" ? getSystemTheme() : initialTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [defaultTheme, storageKey]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);

      const resolved = next === "system" ? getSystemTheme() : next;
      setResolvedTheme(resolved);
      applyTheme(resolved);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, next);
      }
    },
    [storageKey]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const applyTheme = (theme: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
};

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export { ThemeProvider, useTheme, ThemeContext };







