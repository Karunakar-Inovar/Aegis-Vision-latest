import type { ThemeColorMode, ThemeColors } from "../../theme/colors";

const colorsData = require("../../theme/colors") as ThemeColors;

export type { ThemeColorMode, ThemeColors };
export type ColorKey = keyof ThemeColors["light"];

/**
 * Theme Color Tokens
 *
 * These values mirror the CSS custom properties defined in
 * `apps/web/app/globals.css` and `apps/storybook/styles/globals.css`.
 * They exist so Storybook (and any other Node/SSR tooling) can import
 * concrete color values without relying on CSS variables.
 */
export const colors: ThemeColors = colorsData;

