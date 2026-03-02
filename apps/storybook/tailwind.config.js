const { fontFamily } = require("tailwindcss/defaultTheme");
const sharedConfig = require("../../packages/ui/tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig,
  content: [
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/app/**/*.{js,ts,jsx,tsx}",
  ],
  important: "#storybook-root",
  theme: {
    ...sharedConfig.theme,
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      ...sharedConfig.theme.extend,
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [
    ...(sharedConfig.plugins || []),
    require("tailwindcss-animate"),
  ],
};
