/**
 * Dark Mode Utility Functions
 *
 * Helper functions to apply dark mode classes consistently across components.
 * These utilities work with NativeWind v4's dark mode support.
 */

/**
 * Applies dark mode background color
 * Usage: className={darkBg("background")} // "bg-background dark:bg-[#1a1f35]"
 */
export function darkBg(color: string): string {
  const darkColors: Record<string, string> = {
    background: "dark:bg-[#1a1f35]",
    card: "dark:bg-[#2e3750]",
    popover: "dark:bg-[#2e3750]",
    muted: "dark:bg-[#2a3147]",
    secondary: "dark:bg-[#3d4663]",
    accent: "dark:bg-[#454e6a]",
    primary: "dark:bg-[#7c7cff]",
    destructive: "dark:bg-[#e54d4d]",
  };
  return darkColors[color] || "";
}

/**
 * Applies dark mode text color
 * Usage: className={darkText("foreground")} // "text-foreground dark:text-[#e8ebf0]"
 */
export function darkText(color: string): string {
  const darkColors: Record<string, string> = {
    foreground: "dark:text-[#e8ebf0]",
    "card-foreground": "dark:text-[#e8ebf0]",
    "popover-foreground": "dark:text-[#e8ebf0]",
    "primary-foreground": "dark:text-[#1a1f35]",
    "secondary-foreground": "dark:text-[#d4d9e1]",
    "muted-foreground": "dark:text-[#9ca3af]",
    "accent-foreground": "dark:text-[#d4d9e1]",
    "destructive-foreground": "dark:text-[#1a1f35]",
    primary: "dark:text-[#7c7cff]",
    destructive: "dark:text-[#e54d4d]",
  };
  return darkColors[color] || "";
}

/**
 * Applies dark mode border color
 * Usage: className={darkBorder("border")} // "border-border dark:border-[#4a5568]"
 */
export function darkBorder(color: string): string {
  const darkColors: Record<string, string> = {
    border: "dark:border-[#4a5568]",
    input: "dark:border-[#4a5568]",
    primary: "dark:border-[#7c7cff]",
    destructive: "dark:border-[#e54d4d]",
  };
  return darkColors[color] || "";
}

/**
 * Combines light and dark mode classes for common patterns
 * Usage: className={darkMode("bg-background", "text-foreground")}
 */
export function darkMode(
  bg?: string,
  text?: string,
  border?: string
): string {
  const classes: string[] = [];
  
  if (bg) {
    classes.push(bg);
    const darkBgClass = darkBg(bg.replace("bg-", ""));
    if (darkBgClass) classes.push(darkBgClass);
  }
  
  if (text) {
    classes.push(text);
    const darkTextClass = darkText(text.replace("text-", ""));
    if (darkTextClass) classes.push(darkTextClass);
  }
  
  if (border) {
    classes.push(border);
    const darkBorderClass = darkBorder(border.replace("border-", ""));
    if (darkBorderClass) classes.push(darkBorderClass);
  }
  
  return classes.join(" ");
}







