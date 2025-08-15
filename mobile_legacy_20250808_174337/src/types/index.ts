// React Native tipleri ve global değişkenler için

declare global {
  var __DEV__: boolean;
}

// Görev tipleri
export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: User;
  createdBy: User;
  group: Group;
  slaHours: number;
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  category: TaskCategory;
  estimatedDuration?: number;
  points: number;
  comments: TaskComment[];
  attachments: string[];
  musicSettings?: MusicSettings;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskCategory {
  CLEANING = 'cleaning',
  COOKING = 'cooking',
  SHOPPING = 'shopping',
  MAINTENANCE = 'maintenance',
  ORGANIZATION = 'organization',
  CHILDCARE = 'childcare',
  PETCARE = 'petcare',
  GARDEN = 'garden',
  OTHER = 'other',
}

export interface TaskComment {
  _id: string;
  userId: User;
  comment: string;
  createdAt: Date;
}

export interface MusicSettings {
  spotifyPlaylistId?: string;
  youtubePlaylistId?: string;
  autoPlay: boolean;
}

// Kullanıcı tipleri
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  phoneNumber?: string;
  groups: Group[];
  notificationPreferences: NotificationPreferences;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  taskReminders: boolean;
  groupMessages: boolean;
}

// Grup tipleri
export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  settings: GroupSettings;
  plan: GroupPlan;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  user: User;
  role: GroupRole;
  joinedAt: Date;
}

export enum GroupRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface GroupSettings {
  defaultSlaHours: number;
  allowGuestInvites: boolean;
  taskAutoAssignment: boolean;
  gamificationEnabled: boolean;
}

export interface GroupPlan {
  type: 'free' | 'premium' | 'family';
  maxMembers: number;
  maxTasksPerMonth: number;
  features: string[];
  expiresAt?: Date;
}

// API yanıt tipleri
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation tipleri
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  TaskDetail: { taskId: string };
  TaskCreate: { groupId?: string };
  TaskEdit: { taskId: string };
  Profile: undefined;
  Settings: undefined;
  GroupDetail: { groupId: string };
  GroupCreate: undefined;
  GroupEdit: { groupId: string };
  GroupMembers: { groupId: string };
  Notifications: undefined;
  MusicPlayer: { taskId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Groups: undefined;
  Profile: undefined;
  More: undefined;
};

// Redux state tipleri
export interface RootState {
  auth: AuthState;
  tasks: TasksState;
  groups: GroupsState;
  notifications: NotificationsState;
  ui: UIState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: PaginationState;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  groupId?: string;
  category?: TaskCategory;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  isOnline: boolean;
  activeScreen: string;
}

// WebSocket mesaj tipleri
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface TaskUpdateMessage extends WebSocketMessage {
  type: 'TASK_UPDATE';
  payload: {
    taskId: string;
    updates: Partial<Task>;
    updatedBy: User;
  };
}

export interface CommentAddedMessage extends WebSocketMessage {
  type: 'COMMENT_ADDED';
  payload: {
    taskId: string;
    comment: TaskComment;
  };
}

export interface NotificationMessage extends WebSocketMessage {
  type: 'NOTIFICATION';
  payload: {
    notification: Notification;
  };
}
