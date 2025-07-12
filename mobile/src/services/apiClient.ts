import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Config from '../config/config';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor - Token ekle
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          // Request log (sadece development'te)
          if (__DEV__) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
            if (config.data) {
              console.log('📦 Request Data:', config.data);
            }
          }
        } catch (error) {
          console.error('Token alınamadı:', error);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor - Hata yönetimi
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Success response log (sadece development'te)
        if (__DEV__) {
          console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Response log (sadece development'te)
        if (__DEV__) {
          console.log(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
          console.log('Error details:', error.response?.data);
        }

        // 401 Unauthorized - Token süresi dolmuş
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            // Token yenilendikten sonra original request'i tekrar dene
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token da geçersizse kullanıcıyı login'e yönlendir
            await this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        // 403 Forbidden
        if (error.response?.status === 403) {
          Alert.alert(
            'Yetkisiz İşlem',
            'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.',
            [{ text: 'Tamam' }]
          );
        }

        // 404 Not Found
        if (error.response?.status === 404) {
          Alert.alert(
            'Bulunamadı',
            'Aradığınız kaynak bulunamadı.',
            [{ text: 'Tamam' }]
          );
        }

        // 500 Internal Server Error
        if (error.response?.status >= 500) {
          Alert.alert(
            'Sunucu Hatası',
            'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            [{ text: 'Tamam' }]
          );
        }

        // Network Error
        if (error.code === 'NETWORK_ERROR' || !error.response) {
          Alert.alert(
            'Bağlantı Hatası',
            'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
            [{ text: 'Tamam' }]
          );
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }

      const response = await axios.post(`${Config.API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data.data;
      
      await AsyncStorage.setItem('auth_token', token);
      if (newRefreshToken) {
        await AsyncStorage.setItem('refresh_token', newRefreshToken);
      }
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      throw error;
    }
  }

  private async handleLogout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      // Redux store'u temizle ve login ekranına yönlendir
      // Bu işlem Redux action'ı ile yapılacak
    } catch (error) {
      console.error('Logout işlemi sırasında hata:', error);
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  // Dosya yükleme işlemleri için
  async uploadFile(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  // İndirme işlemleri için
  async downloadFile(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });
  }

  // Token manuel olarak set etme (login sonrası)
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('auth_token', token);
  }

  // Token temizleme
  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem('auth_token');
  }

  // Instance'ı dışarıya aç (gerekirse)
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
