import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/auth.store';

// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Client Instance
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
  // Simple guard to avoid multiple rapid redirects on repeated 401s during HMR
  let lastRedirectAt = 0;

    // Request Interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Handle common responses
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't try to refresh for auth endpoints to avoid loops
          const reqUrl: string = originalRequest?.url || '';
          const isAuthEndpoint = reqUrl.includes('/auth/');
          originalRequest._retry = true;

          try {
            if (!isAuthEndpoint) {
              await this.refreshToken();
              const token = this.getAuthToken();
              if (token) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              }
            }
          } catch {
            // fallthrough to logout & redirect below
          }

          // Clear state/tokens and redirect to login once
          if (typeof window !== 'undefined') {
            try {
              // Reset Zustand auth state (also clears tokens from localStorage)
              useAuthStore.getState().logout();
            } catch {}
            // Avoid thrashing: only redirect if not already on login and not too frequent
            const now = Date.now();
            if (
              !window.location.pathname.startsWith('/login') &&
              now - lastRedirectAt > 1000
            ) {
              lastRedirectAt = now;
              window.location.href = '/login';
            }
          }
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', newRefreshToken);
  }

  // Generic HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
    return response.data.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<unknown> = await this.client.post(url, data, config);
    
    // Backend response'u data field'ı varsa onu döndür, yoksa tüm response'u döndür
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return (response.data as ApiResponse<T>).data;
    }
    
    // Eğer success field'ı varsa ve true ise data'yı döndür
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const apiResponse = response.data as { success: boolean; data?: T; [key: string]: unknown };
      if (apiResponse.success) {
        return apiResponse.data || (apiResponse as T);
      }
    }
    
    return response.data as T;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
    return response.data.data;
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
    return response.data.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
    return response.data.data;
  }
}

// API Response Interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Export single instance
export const apiClient = new ApiClient();

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  PROFILE: '/auth/profile',
  VERIFY_TOKEN: '/auth/verify-token',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  
  // Groups
  GROUPS: '/groups',
  USER_GROUPS: '/groups/user',
  
  // Tasks
  TASKS: '/tasks',
  TASK_STATS: '/tasks/stats/overview',
  MY_PENDING_TASKS: '/tasks/my/pending',
  USER_TASKS: '/tasks/user',
  GROUP_TASKS: '/tasks/group',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_STATS: '/notifications/stats',
  USER_NOTIFICATIONS: '/notifications/user',
  
  // Analytics & Stats
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_STATS: '/analytics/stats',
  ANALYTICS_USER_ACTIVITY: '/analytics/users/activity',
  ANALYTICS_TASK_PERFORMANCE: '/analytics/tasks/performance',
  ANALYTICS_GROUP_OVERVIEW: '/analytics/groups/overview',
  
  // Music
  MUSIC_INTEGRATIONS: '/music/integrations',
  MUSIC_STATS: '/music/stats',
  
  // Error Logs
  LOGS_RECENT: '/logs/recent',
  LOGS_STATS: '/logs/stats',
  LOGS_CATEGORIES: '/logs/categories',
} as const;
