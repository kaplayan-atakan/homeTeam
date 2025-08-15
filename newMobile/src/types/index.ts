// Kullanıcı tipi
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Görev tipi
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  groupId: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number; // dakika cinsinden
  actualDuration?: number; // dakika cinsinden
}

// Görev durumu
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Görev öncelik seviyesi
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Grup tipi
export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Grup üyesi tipi
export interface GroupMember {
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  isActive: boolean;
}

// Grup rolleri
export type GroupRole = 'owner' | 'admin' | 'member';

// Bildirim tipi
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

// Bildirim türleri
export type NotificationType = 
  | 'task_assigned' 
  | 'task_due_soon' 
  | 'task_overdue' 
  | 'task_completed' 
  | 'group_invite' 
  | 'comment_added';

// API yanıt tipi
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Redux store durumu
export interface RootState {
  auth: AuthState;
  tasks: TaskState;
  groups: GroupState;
  notifications: NotificationState;
  app: AppState;
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Task state
export interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
}

// Task filtreleri
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  groupId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Group state
export interface GroupState {
  groups: Group[];
  selectedGroup: Group | null;
  isLoading: boolean;
  error: string | null;
}

// Notification state
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// App state
export interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  isOnline: boolean;
  lastSync: Date | null;
}

// Navigation parametre listeleri
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  TaskEdit: { taskId?: string; groupId?: string };
  GroupDetail: { groupId: string };
  Profile: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Welcome: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Groups: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Form validasyon tipi
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// Socket.IO event tipleri
export interface SocketEvents {
  // Client -> Server
  join_group: (groupId: string) => void;
  leave_group: (groupId: string) => void;
  task_update: (taskData: Partial<Task>) => void;
  
  // Server -> Client
  task_updated: (task: Task) => void;
  task_assigned: (task: Task) => void;
  notification_received: (notification: Notification) => void;
  user_status_changed: (userId: string, isOnline: boolean) => void;
}
