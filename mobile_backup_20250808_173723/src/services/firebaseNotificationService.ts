import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { apiClient } from './apiClient';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export interface DeviceTokenRequest {
  token: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    model?: string;
    version?: string;
  };
}

class FirebaseNotificationService {
  private static instance: FirebaseNotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  static getInstance(): FirebaseNotificationService {
    if (!FirebaseNotificationService.instance) {
      FirebaseNotificationService.instance = new FirebaseNotificationService();
    }
    return FirebaseNotificationService.instance;
  }

  // Firebase Messaging başlatma
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('Firebase Messaging already initialized');
        return;
      }

      // Android için notification permission isteği
      if (Platform.OS === 'android') {
        const permission = await this.requestNotificationPermission();
        if (!permission) {
          console.warn('Notification permission denied');
          return;
        }
      }

      // iOS için authorization isteği
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('iOS notification permission denied');
          return;
        }
      }

      // FCM token al
      await this.getFCMToken();
      
      // Background message handler
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Message handled in the background!', remoteMessage);
        this.handleBackgroundNotification(remoteMessage);
      });

      // Foreground message listener
      this.setupForegroundListener();

      // Token refresh listener
      this.setupTokenRefreshListener();

      // Notification opened listener
      this.setupNotificationOpenListener();

      this.isInitialized = true;
      console.log('Firebase Messaging initialized successfully');
      
    } catch (error) {
      console.error('Firebase Messaging initialization failed:', error);
      throw error;
    }
  }

  // Android bildirim izni isteği
  private async requestNotificationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Bildirim İzni',
            message: 'homeTeam uygulaması bildirim gönderebilmek için izin istiyor.',
            buttonNeutral: 'Daha Sonra',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  // FCM Token al ve backend'e kaydet
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      
      if (token) {
        this.fcmToken = token;
        console.log('FCM Token:', token);
        
        // Backend'e token kaydet
        await this.registerDeviceToken(token);
        return token;
      }
      
      console.warn('Failed to get FCM token');
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Device token'ı backend'e kaydet
  private async registerDeviceToken(token: string): Promise<void> {
    try {
      const deviceTokenData: DeviceTokenRequest = {
        token,
        platform: Platform.OS as 'ios' | 'android',
        deviceInfo: {
          model: 'Unknown', // Platform.constants.Model mevcut değil
          version: Platform.Version.toString(),
        },
      };

      await apiClient.post('/notifications/register-device', deviceTokenData);
      console.log('Device token registered successfully');
      
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  // Foreground mesaj dinleyicisi
  private setupForegroundListener(): void {
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      this.handleForegroundNotification(remoteMessage);
    });
  }

  // Token yenileme dinleyicisi
  private setupTokenRefreshListener(): void {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      this.fcmToken = token;
      await this.registerDeviceToken(token);
    });
  }

  // Bildirime tıklanma dinleyicisi
  private setupNotificationOpenListener(): void {
    // Uygulama kapalıyken bildirime tıklanma
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from notification (quit state):', remoteMessage);
        this.handleNotificationOpen(remoteMessage);
      }
    });

    // Uygulama background'dayken bildirime tıklanma
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App opened from notification (background state):', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });
  }

  // Foreground bildirim işleme
  private handleForegroundNotification(message: FirebaseMessagingTypes.RemoteMessage): void {
    // Burada özel bildirim UI'ı gösterebiliriz
    // Örneğin: React Native Paper Snackbar, Toast vs.
    
    const { notification, data } = message;
    
    if (notification) {
      // Custom notification display logic
      console.log('Displaying foreground notification:', notification.title);
      
      // Bildirim gösterme seçenekleri:
      // 1. Custom modal/overlay
      // 2. Snackbar/Toast
      // 3. Badge update
    }
    
    // Data payload varsa özel işlemler
    if (data) {
      this.handleNotificationData(data);
    }
  }

  // Background bildirim işleme
  private handleBackgroundNotification(message: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = message;
    
    if (data) {
      this.handleNotificationData(data);
    }
  }

  // Bildirime tıklanma işleme
  private handleNotificationOpen(message: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = message;
    
    if (data) {
      // Navigation logic based on notification data
      this.handleNotificationNavigation(data);
    }
  }

  // Bildirim data payload işleme
  private handleNotificationData(data: { [key: string]: string | object }): void {
    // Data payload'u string'e çevir
    const stringData: { [key: string]: string } = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });

    const { type, taskId, groupId, userId } = stringData;
    
    switch (type) {
      case 'task_assigned':
        console.log('Task assigned notification:', { taskId, groupId });
        break;
      case 'task_completed':
        console.log('Task completed notification:', { taskId, userId });
        break;
      case 'group_invitation':
        console.log('Group invitation notification:', { groupId });
        break;
      case 'reminder':
        console.log('Reminder notification:', data);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  // Bildirim navigasyon işleme
  private handleNotificationNavigation(data: { [key: string]: string | object }): void {
    // Data payload'u string'e çevir
    const stringData: { [key: string]: string } = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });

    const { type, taskId, groupId } = stringData;
    
    // Navigation service kullanarak yönlendirme
    // Bu kısım navigation structure'a göre customize edilmeli
    
    switch (type) {
      case 'task_assigned':
      case 'task_completed':
        if (taskId) {
          // Navigate to task detail
          console.log('Navigate to task:', taskId);
        }
        break;
      case 'group_invitation':
        if (groupId) {
          // Navigate to group detail
          console.log('Navigate to group:', groupId);
        }
        break;
      default:
        // Navigate to notifications screen
        console.log('Navigate to notifications');
    }
  }

  // Bildirimi okundu olarak işaretle
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Okunmamış bildirim sayısını al
  async getUnreadNotificationCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Failed to get unread notification count:', error);
      return 0;
    }
  }

  // Bildirim geçmişini al
  async getNotificationHistory(page = 1, limit = 20): Promise<any[]> {
    try {
      const response = await apiClient.get(`/notifications/history?page=${page}&limit=${limit}`);
      return response.data?.notifications || [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  // Current FCM token'ı al
  getCurrentToken(): string | null {
    return this.fcmToken;
  }

  // Service durumunu kontrol et
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Device token'ı backend'den sil (logout)
  async unregisterDeviceToken(): Promise<void> {
    try {
      if (this.fcmToken) {
        await apiClient.delete(`/notifications/device-token/${this.fcmToken}`);
        console.log('Device token unregistered successfully');
      }
    } catch (error) {
      console.error('Failed to unregister device token:', error);
    }
  }
}

export const firebaseNotificationService = FirebaseNotificationService.getInstance();
