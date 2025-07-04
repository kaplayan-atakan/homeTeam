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
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Kayıt ol
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/register`, userData);
    
    if (response.data.success && response.data.data.token) {
      // Token'ı ve kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      // Backend'e logout isteği gönder
      await apiClient.post(`${this.baseUrl}/logout`);
    } catch (error) {
      // Backend hatası olsa bile local storage'ı temizle
      console.warn('Logout backend error:', error);
    } finally {
      // Local storage'ı temizle
      await AsyncStorage.multiRemove([
        Config.STORAGE_KEYS.AUTH_TOKEN,
        Config.STORAGE_KEYS.USER,
      ]);
    }
  }

  // Token'ı doğrula
  async verifyToken(): Promise<AuthResponse> {
    const response = await apiClient.get(`${this.baseUrl}/verify`);
    return response.data;
  }

  // Şifre sıfırlama isteği
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/forgot-password`, { email });
    return response.data;
  }

  // Şifre sıfırla
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reset-password`, { 
      token, 
      newPassword 
    });
    return response.data;
  }

  // Şifre değiştir
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`${this.baseUrl}/change-password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Profil güncelle
  async updateProfile(userData: Partial<RegisterData>): Promise<AuthResponse> {
    const response = await apiClient.patch(`${this.baseUrl}/profile`, userData);
    
    if (response.data.success) {
      // Güncellenmiş kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Profil resmi yükle
  async uploadProfileImage(imageFile: FormData): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/upload-profile-image`, imageFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      // Güncellenmiş kullanıcı bilgilerini kaydet
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Email doğrulama
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/verify-email`, { token });
    return response.data;
  }

  // Email doğrulama kodu gönder
  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`${this.baseUrl}/resend-verification`);
    return response.data;
  }

  // OAuth Google giriş
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/oauth/google`, { 
      token: googleToken 
    });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // OAuth Facebook giriş
  async loginWithFacebook(facebookToken: string): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/oauth/facebook`, { 
      token: facebookToken 
    });
    
    if (response.data.success && response.data.data.token) {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }

  // Token'ı local storage'dan al
  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
  }

  // Kullanıcı bilgilerini local storage'dan al
  async getStoredUser(): Promise<any | null> {
    const userString = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  }

  // Token'ı yenile
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post(`${this.baseUrl}/refresh-token`);
    
    if (response.data.success && response.data.data.token) {
      // Yeni token'ı kaydet
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  }
}

export const authService = new AuthService();
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
