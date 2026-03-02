import * as React from "react";
import { Pressable } from "react-native";
import { Sun, Moon } from "../utils/icons";
import { useTheme } from "../theme";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "system") {
      // If currently system, switch to opposite of resolved
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    } else {
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
    >
      {resolvedTheme === "light" ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-foreground" />
      )}
    </Pressable>
  );
}







