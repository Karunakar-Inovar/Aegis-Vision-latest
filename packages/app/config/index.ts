/**
 * API Configuration Helper
 * 
 * Provides environment-specific configuration
 */

export const config = {
  // API Base URL
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:3001/api",

  // Stream API Base URL (for pipeline operations)
  streamApiUrl:
    process.env.NEXT_PUBLIC_API_URL_STREAM ||
    process.env.EXPO_PUBLIC_API_URL_STREAM ||
    "http://192.168.2.199:8001",

  // WebSocket URL
  wsUrl:
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.EXPO_PUBLIC_WS_URL ||
    "ws://localhost:3001",

  wsUrlStream:
    process.env.NEXT_PUBLIC_WS_URL_STREAM ||
    process.env.EXPO_PUBLIC_WS_URL_STREAM ||
    "ws://192.168.2.199:8001",

  // App Info
  appName:
    process.env.NEXT_PUBLIC_APP_NAME ||
    process.env.EXPO_PUBLIC_APP_NAME ||
    "Aegis Vision",

  // Environment
  isDevelopment:
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_APP_ENV === "development" ||
    process.env.EXPO_PUBLIC_APP_ENV === "development",

  isProduction:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production" ||
    process.env.EXPO_PUBLIC_APP_ENV === "production",

  timeout: process.env.NEXT_PUBLIC_API_TIMEOUT || process.env.EXPO_PUBLIC_API_TIMEOUT || 30000
};

export default config;
