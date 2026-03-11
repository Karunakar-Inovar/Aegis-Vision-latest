/** @type {import('next').NextConfig} */

const path = require("path");
const { withExpo } = require("@expo/next-adapter");

// Monorepo root node_modules (apps/web -> apps -> root)
const rootNodeModules = path.resolve(__dirname, "../../node_modules");

// Backend API URL for proxy (avoids CORS and network reachability issues in development)
const apiBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api";

module.exports = withExpo({
  reactStrictMode: true,
  // Proxy API requests to backend - fixes "Network Error" from CORS or unreachable backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendUrl}/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true, // Suppress ESLint checks during production builds
  },
  typescript: {
    ignoreBuildErrors: true, // Suppress TypeScript checks during production builds
  },
  transpilePackages: [
    // you need to list `react-native` because `react-native-web` is aliased to `react-native`.
    "react-native",
    "react-native-web",
    "ui",
    "app",
    "nativewind",
    "react-native-css-interop",
    // Add other packages that need transpiling
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
      "react-native/Libraries/Image/AssetRegistry":
        "react-native-web/dist/cjs/modules/AssetRegistry", // Fix for loading images in web builds with Expo-Image
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
});
