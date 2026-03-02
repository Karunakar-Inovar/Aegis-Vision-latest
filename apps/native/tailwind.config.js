const themeColors = require("../../packages/ui/theme/colors");

/**
 * NativeWind configuration
 *
 * Colors now flow directly from `packages/ui/theme/colors.js` so the
 * native app stays in sync with the shared design tokens used on web
 * and Storybook. Dark-mode overrides should continue to use explicit
 * `dark:bg-[color]` utilities until we introduce runtime token swapping.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.js",
    "./App.js",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: mapFontFamilies(),
      colors: mapColorTokens(themeColors.light),
    },
  },
  plugins: [],
};

function mapFontFamilies() {
  return {
    sans: ["PlusJakartaSans_400Regular"],
    serif: ["DMSerifDisplay_400Regular"],
    mono: ["JetBrainsMono_400Regular"],
  };
}

function mapColorTokens(mode) {
  return {
    border: mode.border,
    input: mode.input,
    ring: mode.ring,
    background: mode.background,
    foreground: mode.foreground,
    primary: {
      DEFAULT: mode.primary.DEFAULT,
      foreground: mode.primary.foreground,
    },
    secondary: {
      DEFAULT: mode.secondary.DEFAULT,
      foreground: mode.secondary.foreground,
    },
    destructive: {
      DEFAULT: mode.destructive.DEFAULT,
      foreground: mode.destructive.foreground,
    },
    muted: {
      DEFAULT: mode.muted.DEFAULT,
      foreground: mode.muted.foreground,
    },
    accent: {
      DEFAULT: mode.accent.DEFAULT,
      foreground: mode.accent.foreground,
    },
    popover: {
      DEFAULT: mode.popover.DEFAULT,
      foreground: mode.popover.foreground,
    },
    card: {
      DEFAULT: mode.card.DEFAULT,
      foreground: mode.card.foreground,
    },
    sidebar: {
      DEFAULT: mode.sidebar.DEFAULT,
      foreground: mode.sidebar.foreground,
      primary: mode.sidebar.primary,
      "primary-foreground": mode.sidebar["primary-foreground"],
      accent: mode.sidebar.accent,
      "accent-foreground": mode.sidebar["accent-foreground"],
      border: mode.sidebar.border,
      ring: mode.sidebar.ring,
    },
    chart: mode.chart,
  };
}
