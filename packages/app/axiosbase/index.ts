
/**
 * Axios API Client Configuration
 *
 * Universal API client that works on both web and native platforms.
 * Includes interceptors for auth, error handling, and request/response transformation.
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getItem, setItem, removeItem, STORAGE_KEYS } from "../utils/storage";
import config from "app/config";
import { API_ENDPOINTS } from "app/constants/api-endpoints";

// ---------- API Configuration ----------
const API_CONFIG = {
  baseURL:  config.apiUrl, // Replace with your API base URL
  timeout: config.timeout, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
};

// Stream API Configuration (for pipeline operations)
const STREAM_API_CONFIG = {
  baseURL: config.streamApiUrl,
  timeout: config.timeout,
  headers: {
    "Content-Type": "application/json",
  },
};

const isDev = config.isDevelopment

// ---------- Create Axios instance ----------
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// ---------- Create Stream API Axios instance ----------
const streamApiClient: AxiosInstance = axios.create(STREAM_API_CONFIG);


/** Extend request config to mark one-time retry attempts */
interface RefreshableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/** Serialize refresh calls to avoid multiple simultaneous refreshes */
let refreshPromise: Promise<string> | null = null;

/** Perform token refresh once and share the result across callers */
const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      // Use a bare axios client (no interceptors) to avoid recursion
      const bareClient = axios.create(API_CONFIG);

      // If your API expects refresh token in cookies, use { withCredentials: true } and no header.
      const res = await bareClient.post<any>(
        API_ENDPOINTS.AUTH.TOKEN_REFRESH,
        {
          refreshToken:refreshToken
        },
      );

      const newAccessToken = res.data?.result.token;
      if (!newAccessToken) {
        throw new Error("Invalid refresh response: missing accessToken");
      }

      // Persist and apply new token to future requests
      await setItem(STORAGE_KEYS.TOKEN, newAccessToken);
      apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

      if (isDev) {
        console.log("[API] Access token refreshed");
      }
      return newAccessToken;
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    // Reset for subsequent refresh attempts
    refreshPromise = null;
  }
};

/** Centralized logout after refresh failure */
const forceLogout = async (reason: string) => {
  await removeItem(STORAGE_KEYS.TOKEN);
  await removeItem(STORAGE_KEYS.USER);
  await removeItem(STORAGE_KEYS.REFRESH_TOKEN); // optional, if you store it

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout", { detail: reason }));
  }
};

// ---------- Request Interceptor ----------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If there's no token in memory, fall back to async retrieval
    return Promise.resolve(getItem<string>(STORAGE_KEYS.TOKEN))
      .then((token) => {
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (isDev) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        return config;
      })
      .catch((error) => {
        console.error("[API] Request interceptor error:", error);
        return config;
      });
  },
  (error: AxiosError) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// ---------- Response Interceptor ----------
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const { response } = error;
    const originalRequest = error.config as RefreshableAxiosRequestConfig;

    if (isDev) {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: response?.status,
        data: response?.data,
        message: error.message,
      });
    }

    // ----- Handle 401: try refresh & retry exactly once -----
    if (response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        // Attach new token to the retried request headers
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };

        // Retry the original request with new token
        return apiClient(originalRequest);
      } catch (refreshErr) {
        console.error("[API] Token refresh failed:", refreshErr);
        await forceLogout("refresh_failed");
        // Bubble up the original error with context
        return Promise.reject({
          message: "Authentication expired and refresh failed",
          status: 401,
          data: response?.data,
          isNetworkError: !response,
          originalError: error,
        });
      }
    }

    // ----- Other status handling -----
    if (response) {
      switch (response.status) {
        case 403:
          console.warn("[API] Access forbidden:", response.data);
          break;
        case 404:
          console.warn("[API] Resource not found:", originalRequest?.url);
          break;
        case 422:
          console.warn("[API] Validation error:", response.data);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error("[API] Server error:", response.status, response.data);
          break;
        default:
          console.error("[API] Unexpected error:", response.status, response.data);
      }
    } else if (error.request) {
      console.error("[API] Network error - no response received");
    } else {
      console.error("[API] Request setup error:", error.message);
    }

    // Return formatted error
    return Promise.reject({
      message: error.message,
      status: response?.status,
      data: response?.data,
      isNetworkError: !response,
      originalError: error,
    });
  }
);


// ---------- Request Interceptor ----------
streamApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If there's no token in memory, fall back to async retrieval
    return Promise.resolve(getItem<string>(STORAGE_KEYS.TOKEN))
      .then((token) => {
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (isDev) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        return config;
      })
      .catch((error) => {
        console.error("[API] Request interceptor error:", error);
        return config;
      });
  },
  (error: AxiosError) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// ---------- Response Interceptor ----------
streamApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const { response } = error;
    const originalRequest = error.config as RefreshableAxiosRequestConfig;

    if (isDev) {
      console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: response?.status,
        data: response?.data,
        message: error.message,
      });
    }

    // ----- Handle 401: try refresh & retry exactly once -----
    if (response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();

        // Attach new token to the retried request headers
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };

        // Retry the original request with new token
        return apiClient(originalRequest);
      } catch (refreshErr) {
        console.error("[API] Token refresh failed:", refreshErr);
        await forceLogout("refresh_failed");
        // Bubble up the original error with context
        return Promise.reject({
          message: "Authentication expired and refresh failed",
          status: 401,
          data: response?.data,
          isNetworkError: !response,
          originalError: error,
        });
      }
    }

    // ----- Other status handling -----
    if (response) {
      switch (response.status) {
        case 403:
          console.warn("[API] Access forbidden:", response.data);
          break;
        case 404:
          console.warn("[API] Resource not found:", originalRequest?.url);
          break;
        case 422:
          console.warn("[API] Validation error:", response.data);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error("[API] Server error:", response.status, response.data);
          break;
        default:
          console.error("[API] Unexpected error:", response.status, response.data);
      }
    } else if (error.request) {
      console.error("[API] Network error - no response received");
    } else {
      console.error("[API] Request setup error:", error.message);
    }

    // Return formatted error
    return Promise.reject({
      message: error.message,
      status: response?.status,
      data: response?.data,
      isNetworkError: !response,
      originalError: error,
    });
  }
);

// ---------- Convenience Methods ----------
export const API = {
  /** GET request */
  get: async <T = any>(url: string, config = {}) => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  /** POST request */
  post: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  /** PUT request */
  put: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  /** PATCH request */
  patch: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  /** DELETE request */
  delete: async <T = any>(url: string, config = {}) => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  /** Set authentication token */
  setAuthToken: async (token: string) => {
    await setItem(STORAGE_KEYS.TOKEN, token);
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  },

  /** Clear authentication token */
  clearAuthToken: async () => {
    await removeItem(STORAGE_KEYS.TOKEN);
    delete apiClient.defaults.headers.Authorization;
  },

  /** Get current auth token */
  getAuthToken: async () => {
    return await getItem<string>(STORAGE_KEYS.TOKEN);
  },

  /** (NEW) Set refresh token */
  setRefreshToken: async (refreshToken: string) => {
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  /** (NEW) Clear refresh token */
  clearRefreshToken: async () => {
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /** (NEW) Get refresh token */
  getRefreshToken: async () => {
    return await getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

// ---------- Stream API Convenience Methods ----------
export const STREAM_API = {
  /** GET request to Stream API */
  get: async <T = any>(url: string, config = {}) => {
    const response = await streamApiClient.get<T>(url, config);
    return response.data;
  },

  /** POST request to Stream API */
  post: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await streamApiClient.post<T>(url, data, config);
    return response.data;
  },

  /** PUT request to Stream API */
  put: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await streamApiClient.put<T>(url, data, config);
    return response.data;
  },

  /** PATCH request to Stream API */
  patch: async <T = any>(url: string, data?: any, config = {}) => {
    const response = await streamApiClient.patch<T>(url, data, config);
    return response.data;
  },

  /** DELETE request to Stream API */
  delete: async <T = any>(url: string, config = {}) => {
    const response = await streamApiClient.delete<T>(url, config);
    return response.data;
  },
};

// Export the raw axios instance for advanced use cases
export { apiClient, streamApiClient };
export default API;
