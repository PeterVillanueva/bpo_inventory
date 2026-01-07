/**
 * Centralized Axios API Client
 * 
 * Provides a single Axios instance with:
 * - Base URL configuration
 * - Auth token injection via interceptors
 * - Global error handling
 * - Typed responses
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get auth token from localStorage (client-side only)
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
}

// Set auth token in localStorage (client-side only)
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('token', token);
}

// Remove auth token from localStorage (client-side only)
export function removeAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('token');
}

// Get auth token (for server-side compatibility)
export function getAuthTokenSync(): string | null {
  return getAuthToken();
}

/**
 * Create and configure the Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for fallback auth
});

/**
 * Request interceptor: Inject auth token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      removeAuthToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Return error response for handling in components
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any; // Allow additional response fields
}

/**
 * Helper to extract data from API response
 */
export function extractApiData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.error || 'API request failed');
  }
  // Return the entire response data if no nested data field, otherwise return data field
  return (response.data.data !== undefined ? response.data.data : response.data) as T;
}
