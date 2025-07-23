import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../apiClient';
import Config from '../../config/config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
      phone?: string;
    };
    token: string;
  };
}

export class AuthService {
  private baseUrl = '/auth';

  // Giriş yap
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/login`, credentials);
    
    if (response.data.success && response.data.data.token) {
      // Token'ı ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Kayıt ol
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/register`, userData);
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/logout`);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Local storage'ı temizle
      await AsyncStorage.multiRemove([
        Config.STORAGE_KEYS.AUTH_TOKEN,
        Config.STORAGE_KEYS.USER_DATA,
        Config.STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    }
  }

  // Token yenile
  async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
    const response = await apiClient.post(`${this.baseUrl}/refresh`, { refreshToken });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      return response.data.data.token;
    }
    
    throw new Error('Token yenilenemedi');
  }

  // Profil güncelle
  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.patch(`${this.baseUrl}/profile`, userData);
    
    if (response.data.success) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Şifre değiştir
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`${this.baseUrl}/change-password`, passwordData);
    return response.data;
  }

  // Şifremi unuttum
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/forgot-password`, { email });
    return response.data;
  }

  // Şifre sıfırla
  async resetPassword(resetData: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reset-password`, resetData);
    return response.data;
  }

  // Google ile giriş
  async googleLogin(googleToken: string): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/google`, { token: googleToken });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Facebook ile giriş
  async facebookLogin(facebookToken: string): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/facebook`, { token: facebookToken });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }
}

export const authService = new AuthService();