// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' // Development
  : 'https://your-production-domain.com/api'; // Production

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    GOOGLE: '/auth/google',
    FACEBOOK: '/auth/facebook',
  },
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
    DELETE: '/users/profile',
    SEARCH: '/users/search',
  },
  GROUPS: {
    LIST: '/groups',
    CREATE: '/groups',
    DETAIL: (id: string) => `/groups/${id}`,
    UPDATE: (id: string) => `/groups/${id}`,
    DELETE: (id: string) => `/groups/${id}`,
    MEMBERS: (id: string) => `/groups/${id}/members`,
    ADD_MEMBER: (id: string) => `/groups/${id}/members`,
    REMOVE_MEMBER: (id: string, userId: string) => `/groups/${id}/members/${userId}`,
    LEAVE: (id: string) => `/groups/${id}/leave`,
    INVITE: (id: string) => `/groups/${id}/invite`,
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
    ASSIGN: (id: string) => `/tasks/${id}/assign`,
    COMMENTS: (id: string) => `/tasks/${id}/comments`,
    ADD_COMMENT: (id: string) => `/tasks/${id}/comments`,
    MY_TASKS: '/tasks/my',
    MY_PENDING: '/tasks/my/pending',
    MY_COMPLETED: '/tasks/my/completed',
    GROUP_TASKS: (groupId: string) => `/tasks/group/${groupId}`,
    STATS: '/tasks/stats',
    BULK_UPDATE: '/tasks/bulk-update',
    TEMPLATES: '/tasks/templates',
    SUBTASKS: (id: string) => `/tasks/${id}/subtasks`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
  },
  MUSIC: {
    SPOTIFY_AUTH: '/music/spotify/auth',
    SPOTIFY_CALLBACK: '/music/spotify/callback',
    YOUTUBE_CONNECT: '/music/youtube/connect',
    PLAYLISTS: '/music/playlists',
    PLAY_TASK_MUSIC: (taskId: string) => `/music/tasks/${taskId}/play`,
    STOP_TASK_MUSIC: (taskId: string) => `/music/tasks/${taskId}/stop`,
    MAP_TASK_MUSIC: '/music/map-task',
  },
};

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Room Management
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
  
  // Task Events
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_DELETED: 'task_deleted',
  
  // Comment Events
  COMMENT_ADDED: 'comment_added',
  COMMENT_UPDATED: 'comment_updated',
  COMMENT_DELETED: 'comment_deleted',
  
  // Group Events
  GROUP_UPDATED: 'group_updated',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_LEFT: 'member_left',
  
  // Notification Events
  NOTIFICATION_RECEIVED: 'notification_received',
  SLA_WARNING: 'sla_warning',
  SLA_EXCEEDED: 'sla_exceeded',
  
  // Music Events
  MUSIC_STARTED: 'music_started',
  MUSIC_STOPPED: 'music_stopped',
  
  // User Events
  USER_STATUS_CHANGED: 'user_status_changed',
  USER_TYPING: 'user_typing',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'homeTeam',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  WEBSOCKET_TIMEOUT: 5000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  PAGINATION_LIMIT: 20,
};

// AsyncStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@homeTeam:authToken',
  USER_DATA: '@homeTeam:userData',
  GROUPS: '@homeTeam:groups',
  NOTIFICATIONS_SETTINGS: '@homeTeam:notificationSettings',
  THEME_PREFERENCE: '@homeTeam:themePreference',
  LANGUAGE_PREFERENCE: '@homeTeam:languagePreference',
  MUSIC_SETTINGS: '@homeTeam:musicSettings',
};

// Task Status and Priority
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// Colors
export const COLORS = {
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
  
  // Task Status Colors
  TASK_PENDING: '#FFA726',
  TASK_IN_PROGRESS: '#42A5F5',
  TASK_COMPLETED: '#66BB6A',
  TASK_OVERDUE: '#EF5350',
  TASK_CANCELLED: '#BDBDBD',
  
  // Priority Colors
  PRIORITY_LOW: '#81C784',
  PRIORITY_MEDIUM: '#FFB74D',
  PRIORITY_HIGH: '#FF8A65',
  PRIORITY_URGENT: '#E57373',
};

// Typography
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    REGULAR: 'Roboto-Regular',
    MEDIUM: 'Roboto-Medium',
    BOLD: 'Roboto-Bold',
  },
  FONT_SIZE: {
    CAPTION: 12,
    BODY: 14,
    SUBTITLE: 16,
    TITLE: 18,
    HEADLINE: 20,
    DISPLAY: 24,
  },
};

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
};

// Screen Dimensions (will be set dynamically)
export const SCREEN = {
  WIDTH: 0, // Will be set in App.tsx
  HEIGHT: 0, // Will be set in App.tsx
};
