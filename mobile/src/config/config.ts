import { Platform } from 'react-native';

// Environment değişkenleri
const Config = {
  // API Konfigürasyonu
  API_BASE_URL: __DEV__ 
    ? Platform.select({
        ios: 'http://localhost:3001/api',
        android: 'http://10.0.2.2:3001/api', // Android emulator için
      })
    : 'https://your-production-api.com/api',

  // WebSocket Konfigürasyonu  
  WEBSOCKET_URL: __DEV__
    ? Platform.select({
        ios: 'ws://localhost:3001',
        android: 'ws://10.0.2.2:3001',
      })
    : 'wss://your-production-api.com',

  // Timeout ayarları
  API_TIMEOUT: 10000, // 10 saniye
  WEBSOCKET_TIMEOUT: 5000, // 5 saniye

  // Cache ayarları
  CACHE_DURATION: 5 * 60 * 1000, // 5 dakika
  IMAGE_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 saat

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

  // Push Notifications
  FIREBASE_CONFIG: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id',
  },

  // Social Auth
  GOOGLE_AUTH: {
    webClientId: 'your-google-web-client-id',
    iosClientId: 'your-google-ios-client-id',
  },

  FACEBOOK_AUTH: {
    appId: 'your-facebook-app-id',
  },

  // Spotify Integration
  SPOTIFY_CONFIG: {
    clientId: 'your-spotify-client-id',
    redirectUri: 'hometeam://spotify-callback',
  },

  // YouTube Integration  
  YOUTUBE_CONFIG: {
    apiKey: 'your-youtube-api-key',
  },

  // App Konfigürasyonu
  APP_VERSION: '1.0.0',
  MIN_SUPPORTED_VERSION: '1.0.0',
  
  // Geliştirici Ayarları
  ENABLE_FLIPPER: __DEV__,
  ENABLE_REACTOTRON: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',

  // Feature Flags
  FEATURES: {
    MUSIC_INTEGRATION: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_AUTH: true,
    OFFLINE_MODE: true,
    DARK_MODE: true,
  },

  // AsyncStorage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
    CACHE_PREFIX: 'cache_',
  },

  // Error Codes
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
  },

  // Animation Durations
  ANIMATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },

  // Colors (Fallback - normalde theme'den gelir)
  COLORS: {
    PRIMARY: '#6200EE',
    PRIMARY_VARIANT: '#3700B3',
    SECONDARY: '#03DAC6',
    BACKGROUND: '#FFFFFF',
    SURFACE: '#FFFFFF',
    ERROR: '#B00020',
    ON_PRIMARY: '#FFFFFF',
    ON_SECONDARY: '#000000',
    ON_BACKGROUND: '#000000',
    ON_SURFACE: '#000000',
    ON_ERROR: '#FFFFFF',
  },
};

export default Config;
