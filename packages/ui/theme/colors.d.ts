export type PrimitiveColor = string;

export type ThemeColorMode = {
  background: PrimitiveColor;
  foreground: PrimitiveColor;
  card: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  popover: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  primary: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  secondary: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  muted: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  accent: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  destructive: { DEFAULT: PrimitiveColor; foreground: PrimitiveColor };
  border: PrimitiveColor;
  input: PrimitiveColor;
  ring: PrimitiveColor;
  chart: Record<"1" | "2" | "3" | "4" | "5", PrimitiveColor>;
  sidebar: {
    DEFAULT: PrimitiveColor;
    foreground: PrimitiveColor;
    primary: PrimitiveColor;
    "primary-foreground": PrimitiveColor;
    accent: PrimitiveColor;
    "accent-foreground": PrimitiveColor;
    border: PrimitiveColor;
    ring: PrimitiveColor;
  };
};

export type ThemeColors = {
  light: ThemeColorMode;
  dark: ThemeColorMode;
};

declare const colors: ThemeColors;

export = colors;






