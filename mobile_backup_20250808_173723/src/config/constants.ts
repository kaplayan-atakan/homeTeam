// Uygulama genelinde kullanılacak sabit değerler

export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3001/api' 
    : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const WEBSOCKET_CONFIG = {
  URL: __DEV__ 
    ? 'ws://localhost:3001' 
    : 'wss://your-production-ws.com',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 3000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@homeTeam:authToken',
  USER_DATA: '@homeTeam:userData',
  SETTINGS: '@homeTeam:settings',
  OFFLINE_TASKS: '@homeTeam:offlineTasks',
};

export const APP_CONFIG = {
  APP_NAME: 'homeTeam',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'destek@hometeam.app',
  PRIVACY_URL: 'https://hometeam.app/privacy',
  TERMS_URL: 'https://hometeam.app/terms',
};

// SLA ve görev ayarları
export const TASK_CONFIG = {
  DEFAULT_SLA_HOURS: 24,
  MAX_SLA_HOURS: 720, // 30 gün
  PRIORITY_COLORS: {
    low: '#4CAF50',
    medium: '#FF9800', 
    high: '#F44336',
    urgent: '#9C27B0',
  },
  STATUS_COLORS: {
    pending: '#FFC107',
    in_progress: '#2196F3',
    completed: '#4CAF50',
    overdue: '#F44336',
    cancelled: '#9E9E9E',
  },
};

// Bildirim ayarları
export const NOTIFICATION_CONFIG = {
  SLA_WARNING_HOURS: [24, 8, 2, 1], // SLA'dan kaç saat önce uyarı verilecek
  TYPES: {
    TASK_ASSIGNED: 'task_assigned',
    TASK_DUE_SOON: 'task_due_soon',
    TASK_OVERDUE: 'task_overdue',
    TASK_COMPLETED: 'task_completed',
    COMMENT_ADDED: 'comment_added',
    GROUP_INVITE: 'group_invite',
  },
};

// Müzik entegrasyonu
export const MUSIC_CONFIG = {
  SPOTIFY: {
    CLIENT_ID: 'your-spotify-client-id',
    REDIRECT_URI: 'hometeam://auth/spotify',
  },
  YOUTUBE: {
    API_KEY: 'your-youtube-api-key',
  },
};

// Performans ayarları
export const PERFORMANCE_CONFIG = {
  TASK_LIST_PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 500,
  IMAGE_CACHE_SIZE: 100, // MB
  OFFLINE_CACHE_DAYS: 7,
};
