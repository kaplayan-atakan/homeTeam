import { apiClient } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  };
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  phone?: string;
}

class AuthService {
  private tokenKey = Config.STORAGE_KEYS.AUTH_TOKEN;
  private refreshTokenKey = Config.STORAGE_KEYS.REFRESH_TOKEN;
  private userKey = Config.STORAGE_KEYS.USER_DATA;

  // Login
  async login(credentials: LoginRequest): Promise<{ data: AuthResponse }> {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.data.success) {
      // Backend'den gelen format: {user, accessToken}
      const authData = {
        user: {
          id: response.data.data.user._id || response.data.data.user.id,
          firstName: response.data.data.user.firstName,
          lastName: response.data.data.user.lastName,
          email: response.data.data.user.email,
          profileImage: response.data.data.user.profileImage,
        },
        token: response.data.data.accessToken,
        refreshToken: '', // Backend'de refresh token yok şimdilik
      };
      
      await this.storeAuthData(authData);
      return { data: authData };
    }
    
    throw new Error(response.data.message || 'Giriş başarısız');
  }

  // Register
  async register(userData: RegisterRequest): Promise<{ data: AuthResponse }> {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.data.success) {
      await this.storeAuthData(response.data.data);
    }
    
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  // Token yenileme
  async refreshToken(): Promise<{ data: AuthResponse }> {
    const refreshToken = await AsyncStorage.getItem(this.refreshTokenKey);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    
    if (response.data.success) {
      await this.storeAuthData(response.data.data);
    }
    
    return response.data;
  }

  // Token doğrulama
  async verifyToken(): Promise<{ data: User }> {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  // Kullanıcı profili güncelleme
  async updateProfile(profileData: Partial<User>): Promise<{ data: User }> {
    const response = await apiClient.patch('/auth/profile', profileData);
    
    if (response.data.success) {
      await AsyncStorage.setItem(this.userKey, JSON.stringify(response.data.data));
    }
    
    return response.data;
  }

  // Şifre değiştirme
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Şifre sıfırlama isteği
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  // Şifre sıfırlama
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }

  // OAuth ile giriş
  async loginWithGoogle(googleToken: string): Promise<{ data: AuthResponse }> {
    const response = await apiClient.post('/auth/google', { token: googleToken });
    
    if (response.data.success) {
      await this.storeAuthData(response.data.data);
    }
    
    return response.data;
  }

  async loginWithFacebook(facebookToken: string): Promise<{ data: AuthResponse }> {
    const response = await apiClient.post('/auth/facebook', { token: facebookToken });
    
    if (response.data.success) {
      await this.storeAuthData(response.data.data);
    }
    
    return response.data;
  }

  // Token'ı local storage'dan al
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.tokenKey);
  }

  // Kullanıcı bilgilerini al
  async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Giriş yapıp yapmadığını kontrol et
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  // Auth verilerini kaydet
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.tokenKey, authData.token),
      AsyncStorage.setItem(this.refreshTokenKey, authData.refreshToken),
      AsyncStorage.setItem(this.userKey, JSON.stringify(authData.user)),
    ]);
  }

  // Auth verilerini temizle
  private async clearAuthData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.tokenKey),
      AsyncStorage.removeItem(this.refreshTokenKey),
      AsyncStorage.removeItem(this.userKey),
    ]);
  }
}

export const authService = new AuthService();
