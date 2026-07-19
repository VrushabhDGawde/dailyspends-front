import axios from 'axios';
import { authApi } from './authApi';

// Create the centralized Axios instance
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh token calls simultaneously
let isRefreshing = false;
// Queue to hold requests while refreshing token
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add the access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spendsense_auth_token') || localStorage.getItem('spendsense_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s and refresh the token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and the request was not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid intercepting the refresh token request itself
      if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, put the request in the queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('spendsense_refresh_token');

      if (!refreshToken) {
        // No refresh token available, force logout
        isRefreshing = false;
        // Optionally trigger a custom event here so AuthContext can logout
        window.dispatchEvent(new Event('spendsense_logout'));
        return Promise.reject(error);
      }

      try {
        const response = await authApi.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response;
        
        // Save new tokens
        localStorage.setItem('spendsense_auth_token', accessToken);
        if (newRefreshToken) {
            localStorage.setItem('spendsense_refresh_token', newRefreshToken);
        }

        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Dispatch logout event if refresh fails
        window.dispatchEvent(new Event('spendsense_logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
