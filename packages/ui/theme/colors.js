/**
 * Shared color tokens.
 *
 * This CommonJS module lets both Node-based tooling (Tailwind configs)
 * and TypeScript modules consume the exact same palette. Web apps still
 * map these tokens to CSS custom properties, while native apps can read
 * the concrete values directly.
 *
 * React Native does not understand `oklch()` notation, so we normalize all
 * values to HEX via `culori` as part of the build step. Web consumers can
 * continue to rely on CSS variables defined in their global styles.
 */
const { formatHex, parse } = require("culori");

const rawColors = {
  light: {
    background: "oklch(0.9837 0.0051 247.8759)",
    foreground: "oklch(0.1481 0.0197 257.2822)",
    card: {
      DEFAULT: "oklch(1 0 0)",
      foreground: "oklch(0.2762 0.0514 259.0249)",
    },
    popover: {
      DEFAULT: "oklch(1 0 0)",
      foreground: "oklch(0.2762 0.0514 259.0249)",
    },
    primary: {
      DEFAULT: "oklch(0.4901 0.2874 268.1244)",
      foreground: "oklch(1 0 0)",
    },
    secondary: {
      DEFAULT: "oklch(0.9271 0.0075 260.7315)",
      foreground: "oklch(0.2479 0.0703 258.9953)",
    },
    muted: {
      DEFAULT: "oklch(0.9665 0.0045 258.3247)",
      foreground: "oklch(0.5471 0.0321 263.2921)",
    },
    accent: {
      DEFAULT: "oklch(0.9299 0.0334 272.7879)",
      foreground: "oklch(0.3689 0.0423 259.2778)",
    },
    destructive: {
      DEFAULT: "oklch(0.6496 0.2362 26.9032)",
      foreground: "oklch(1 0 0)",
    },
    border: "oklch(0.8708 0.0128 255.5128)",
    input: "oklch(0.8708 0.0128 255.5128)",
    ring: "oklch(0.5663 0.2398 274.5785)",
    chart: {
      1: "oklch(0.5663 0.2398 274.5785)",
      2: "oklch(0.4927 0.2865 271.1467)",
      3: "oklch(0.4436 0.2744 269.6681)",
      4: "oklch(0.3833 0.2294 270.4276)",
      5: "oklch(0.3388 0.1805 272.9471)",
    },
    sidebar: {
      DEFAULT: "oklch(0.9665 0.0045 258.3247)",
      foreground: "oklch(0.2762 0.0514 259.0249)",
      primary: "oklch(0.5663 0.2398 274.5785)",
      "primary-foreground": "oklch(1 0 0)",
      accent: "oklch(0.9299 0.0334 272.7879)",
      "accent-foreground": "oklch(0.3689 0.0423 259.2778)",
      border: "oklch(0.8708 0.0128 255.5128)",
      ring: "oklch(0.5663 0.2398 274.5785)",
    },
  },
  dark: {
    background: "oklch(0.2025 0.0543 264.7546)",
    foreground: "oklch(0.9274 0.0178 253.3431)",
    card: {
      DEFAULT: "oklch(0.2762 0.0514 259.0249)",
      foreground: "oklch(0.9274 0.0178 253.3431)",
    },
    popover: {
      DEFAULT: "oklch(0.2762 0.0514 259.0249)",
      foreground: "oklch(0.9274 0.0178 253.3431)",
    },
    primary: {
      DEFAULT: "oklch(0.6682 0.1771 276.2341)",
      foreground: "oklch(0.2025 0.0543 264.7546)",
    },
    secondary: {
      DEFAULT: "oklch(0.3313 0.0451 260.0922)",
      foreground: "oklch(0.8708 0.0128 255.5128)",
    },
    muted: {
      DEFAULT: "oklch(0.24 0.0529 259.0078)",
      foreground: "oklch(0.7098 0.0273 261.1226)",
    },
    accent: {
      DEFAULT: "oklch(0.3689 0.0423 259.2778)",
      foreground: "oklch(0.8708 0.0128 255.5128)",
    },
    destructive: {
      DEFAULT: "oklch(0.6496 0.2362 26.9032)",
      foreground: "oklch(0.2025 0.0543 264.7546)",
    },
    border: "oklch(0.4419 0.0375 257.2811)",
    input: "oklch(0.4419 0.0375 257.2811)",
    ring: "oklch(0.6682 0.1771 276.2341)",
    chart: {
      1: "oklch(0.6682 0.1771 276.2341)",
      2: "oklch(0.5663 0.2398 274.5785)",
      3: "oklch(0.4927 0.2865 271.1467)",
      4: "oklch(0.4436 0.2744 269.6681)",
      5: "oklch(0.3833 0.2294 270.4276)",
    },
    sidebar: {
      DEFAULT: "oklch(0.2762 0.0514 259.0249)",
      foreground: "oklch(0.9274 0.0178 253.3431)",
      primary: "oklch(0.6682 0.1771 276.2341)",
      "primary-foreground": "oklch(0.2025 0.0543 264.7546)",
      accent: "oklch(0.3689 0.0423 259.2778)",
      "accent-foreground": "oklch(0.8708 0.0128 255.5128)",
      border: "oklch(0.4419 0.0375 257.2811)",
      ring: "oklch(0.6682 0.1771 276.2341)",
    },
  },
};

function normalizeColor(value) {
  if (typeof value === "string" && value.startsWith("oklch")) {
    const parsed = parse(value);
    if (parsed) {
      return formatHex(parsed);
    }
  }
  return value;
}

function transformTokens(obj) {
  if (typeof obj !== "object" || obj === null) {
    return normalizeColor(obj);
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = value.map((item) =>
        typeof item === "object" ? transformTokens(item) : normalizeColor(item)
      );
      return acc;
    }

    acc[key] =
      typeof value === "object" && value !== null
        ? transformTokens(value)
        : normalizeColor(value);

    return acc;
  }, Array.isArray(obj) ? [] : {});
}

const colors = transformTokens(rawColors);

module.exports = colors;

