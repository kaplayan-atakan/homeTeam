// API endpoint'leri
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001/api' 
    : 'https://your-production-api.com/api',
  
  WEBSOCKET_URL: __DEV__ 
    ? 'http://localhost:3001' 
    : 'https://your-production-api.com',
  
  TIMEOUT: 10000, // 10 saniye
};

// OAuth yapılandırmaları
export const OAUTH_CONFIG = {
  GOOGLE: {
    WEB_CLIENT_ID: 'your-google-web-client-id',
    IOS_CLIENT_ID: 'your-google-ios-client-id',
    ANDROID_CLIENT_ID: 'your-google-android-client-id',
  },
  
  FACEBOOK: {
    APP_ID: 'your-facebook-app-id',
  },
};

// Müzik servisleri
export const MUSIC_CONFIG = {
  SPOTIFY: {
    CLIENT_ID: 'your-spotify-client-id',
    REDIRECT_URI: 'hometeam://auth/spotify',
  },
  
  YOUTUBE: {
    API_KEY: 'your-youtube-api-key',
  },
};

// Uygulama ayarları
export const APP_CONFIG = {
  APP_NAME: 'homeTeam',
  VERSION: '1.0.0',
  
  // Bildirim ayarları
  NOTIFICATIONS: {
    ENABLED: true,
    SOUND: true,
    VIBRATION: true,
  },
  
  // Cache ayarları
  CACHE: {
    TTL: 300000, // 5 dakika
    MAX_SIZE: 50, // Maximum 50 item
  },
  
  // Offline ayarları
  OFFLINE: {
    ENABLED: true,
    SYNC_INTERVAL: 60000, // 1 dakika
  },
};

// Tema renkleri
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#6200EE',
    SECONDARY: '#03DAC6',
    BACKGROUND: '#FFFFFF',
    SURFACE: '#FFFFFF',
    ERROR: '#B00020',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    INFO: '#2196F3',
  },
  
  DARK_COLORS: {
    PRIMARY: '#BB86FC',
    SECONDARY: '#03DAC6',
    BACKGROUND: '#121212',
    SURFACE: '#1E1E1E',
    ERROR: '#CF6679',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    INFO: '#2196F3',
  },
};
