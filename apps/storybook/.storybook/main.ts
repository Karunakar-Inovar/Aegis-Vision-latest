// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  babel: async (options) => ({
    ...options,
    presets: [...(options?.presets || []), "nativewind/babel"],
  }),
  framework: {
    name: getAbsolutePath("@storybook/react-native-web-vite"),
    options: {
      modulesToTranspile: [
        "nativewind",
        "react-native-css-interop",
      ],
      pluginReactOptions: {
        jsxImportSource: "nativewind",
      },
    },
  },
  async viteFinal(config) {
    const tailwindcss = (await import("tailwindcss")).default;
    const autoprefixer = (await import("autoprefixer")).default;

    // Configure aliases for react-native-web and UI package
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
      "react-native-web": "react-native-web",
      "ui": path.resolve(__dirname, "../../../packages/ui/src"),
    };

    // Ensure UI package dependencies are resolved correctly
    config.resolve.dedupe = config.resolve.dedupe || [];
    if (!config.resolve.dedupe.includes("react")) {
      config.resolve.dedupe.push("react", "react-dom");
    }

    // Add extension handling
    config.resolve.extensions = [
      ".web.tsx",
      ".web.ts", 
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx", 
      ".js",
      ...(config.resolve.extensions || []),
    ];

    // Ensure CSS is properly processed with Tailwind
    config.css = config.css || {};
    config.css.postcss = {
      plugins: [
        tailwindcss({
          config: path.resolve(__dirname, '../tailwind.config.js'),
        }),
        autoprefixer,
      ],
    };

    // Configure for NativeWind web support
    config.define = {
      ...config.define,
      'process.env.EXPO_PUBLIC_USE_STATIC': JSON.stringify('true'),
      '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
    };

    // Optimize dependencies for NativeWind and UI package
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'nativewind',
      'react-native-css-interop',
      'react-native-web',
      'react-native-web/dist/exports/StyleSheet',
    ];

    // Ensure UI package is not excluded and can be resolved
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
    ];

    // Configure server to watch the UI package
    config.server = config.server || {};
    config.server.watch = config.server.watch || {};
    config.server.watch.ignored = config.server.watch.ignored || [];
    
    // Ensure the UI package and node_modules are accessible
    config.server.fs = config.server.fs || {};
    config.server.fs.allow = [
      ...(config.server.fs.allow || []),
      path.resolve(__dirname, "../../../packages"),
      path.resolve(__dirname, "../../../node_modules"),
      path.resolve(__dirname, "../node_modules"),
      path.resolve(__dirname, "../../.."),
    ];

    return config;
  },
  staticDirs: ["../public"],
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
