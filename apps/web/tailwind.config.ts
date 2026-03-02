import type { Config } from "tailwindcss";
const sharedConfig = require("../../packages/ui/tailwind.config.js");

const config: Config = {
  ...sharedConfig,
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/app/**/*.{js,ts,jsx,tsx}",
  ],
  important: "html",
  presets: [require("nativewind/preset")],
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme.extend,
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [
    ...(sharedConfig.plugins || []),
    require("tailwindcss-animate"),
  ],
};
export default config;
