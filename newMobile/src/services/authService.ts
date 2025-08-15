import axios, { AxiosResponse } from 'axios';
import type { User, ApiResponse } from '@/types';
import { API_BASE_URL } from '@/config/constants';

// API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth service
export const authService = {
  // Login
  login: async (credentials: { email: string; password: string }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> => {
    return api.post('/auth/login', credentials);
  },

  // Register
  register: async (userData: { email: string; password: string; name: string }): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> => {
    return api.post('/auth/register', userData);
  },

  // Logout
  logout: async (): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return api.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async (): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> => {
    return api.post('/auth/refresh');
  },

  // Update profile
  updateProfile: async (profileData: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> => {
    return api.put('/auth/profile', profileData);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return api.post('/auth/reset-password', { token, newPassword });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return api.post('/auth/verify-email', { token });
  },

  // Check email availability
  checkEmailAvailability: async (email: string): Promise<AxiosResponse<ApiResponse<{ available: boolean }>>> => {
    return api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
  },
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Token'ı AsyncStorage'dan alacağız
    // Şimdilik placeholder
    const token = null; // getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      // Bu işlem navigation context'inde yapılacak
    }
    return Promise.reject(error);
  }
);

export default api;
