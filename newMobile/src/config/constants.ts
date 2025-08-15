// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'homeTeam';
export const APP_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@homeTeam:authToken',
  USER_DATA: '@homeTeam:userData',
  THEME: '@homeTeam:theme',
  LANGUAGE: '@homeTeam:language',
  LAST_SYNC: '@homeTeam:lastSync',
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
  TASK_UPDATE: 'task_update',
  USER_TYPING: 'user_typing',
  
  // Server -> Client
  TASK_UPDATED: 'task_updated',
  TASK_ASSIGNED: 'task_assigned',
  NOTIFICATION_RECEIVED: 'notification_received',
  USER_STATUS_CHANGED: 'user_status_changed',
  GROUP_UPDATED: 'group_updated',
} as const;

// Default Values
export const DEFAULT_TASK_DURATION = 60; // minutes
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif'];
export const ITEMS_PER_PAGE = 20;

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_DUE_SOON: 'task_due_soon',
  TASK_OVERDUE: 'task_overdue',
  TASK_COMPLETED: 'task_completed',
  GROUP_INVITE: 'group_invite',
  COMMENT_ADDED: 'comment_added',
} as const;

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Group Roles
export const GROUP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen tekrar deneyin.',
  VALIDATION_ERROR: 'Girilen bilgiler geçersiz.',
  UNAUTHORIZED: 'Yetkisiz erişim. Lütfen giriş yapın.',
  FORBIDDEN: 'Bu işlem için yetkiniz bulunmuyor.',
  NOT_FOUND: 'Aranan kaynak bulunamadı.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Başarıyla giriş yapıldı.',
  REGISTER_SUCCESS: 'Hesap başarıyla oluşturuldu.',
  TASK_CREATED: 'Görev başarıyla oluşturuldu.',
  TASK_UPDATED: 'Görev başarıyla güncellendi.',
  TASK_DELETED: 'Görev başarıyla silindi.',
  PROFILE_UPDATED: 'Profil başarıyla güncellendi.',
} as const;
