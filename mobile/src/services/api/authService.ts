import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // AsyncStorage kullanacağız
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş, logout yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Navigation to login screen - Redux action ile yapılacak
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Giriş yap
  async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.data.success && response.data.data.token) {
      // Token'ı kaydet (AsyncStorage kullanılacak)
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  },

  // Kayıt ol
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  },

  // Çıkış yap
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Token'ı temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Token yenile
  async refreshToken() {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response;
  },

  // Profil güncelle
  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
  }) {
    const response = await apiClient.patch(API_ENDPOINTS.AUTH.PROFILE, userData);
    
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  },

  // Şifre değiştir
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await apiClient.patch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
    return response;
  },

  // Şifre sıfırlama isteği
  async forgotPassword(email: string) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response;
  },

  // Şifre sıfırlama
  async resetPassword(resetData: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData);
    return response;
  },

  // OAuth Google giriş
  async googleLogin(googleToken: string) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, { token: googleToken });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  },

  // OAuth Facebook giriş
  async facebookLogin(facebookToken: string) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FACEBOOK, { token: facebookToken });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  },
};

export { apiClient };
