// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  groups: string[];
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
}

// User Types
export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
  isActive?: boolean;
  isEmailVerified?: boolean;
  groups?: string[];
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

// Group Types
export interface Group {
  id: string;
  _id?: string;
  name: string;
  description: string;
  members: string[];
  admins: string[];
  isActive: boolean;
  createdBy?: string;
  settings: {
    isPublic?: boolean;
    allowInvites?: boolean;
    allowMemberInvites?: boolean;
    taskAutoAssign?: boolean;
    taskAssignmentMode?: 'manual' | 'automatic';
    notificationSettings?: {
      newTask: boolean;
      taskCompleted: boolean;
      taskOverdue: boolean;
      newMember: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  user?: User;
}

export interface CreateGroupDto {
  name: string;
  description: string;
  settings?: {
    isPublic?: boolean;
    allowInvites?: boolean;
    taskAutoAssign?: boolean;
  };
}

// Task Types
export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  groupId: string;
  createdBy?: string;
  dueDate: Date;
  completedAt?: Date;
  sla?: {
    dueDate: Date;
    estimatedHours: number;
    actualHours?: number;
  };
  tags?: string[];
  comments?: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
  assignedUser?: User;
  group?: Group;
  createdByUser?: User;
}

export interface TaskComment {
  _id: string;
  content: string;
  userId: string;
  createdAt: Date;
  user?: User;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  groupId: string;
  sla: {
    dueDate: Date;
    estimatedHours: number;
  };
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  sla?: {
    dueDate?: Date;
    estimatedHours?: number;
    actualHours?: number;
  };
  tags?: string[];
}

// Notification Types
export interface Notification {
  _id: string;
  type: 'task_assigned' | 'task_due_soon' | 'task_overdue' | 'task_completed' | 'comment_added' | 'group_invite' | 'system_alert';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  data?: {
    taskId?: string;
    groupId?: string;
    actionUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  activeUsers: number;
  taskCompletionRate: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface TaskAnalytics {
  tasksCreatedByDay: ChartData[];
  tasksCompletedByDay: ChartData[];
  tasksByStatus: ChartData[];
  tasksByPriority: ChartData[];
  averageCompletionTime: number;
  slaComplianceRate: number;
}

export interface UserAnalytics {
  userRegistrationsByDay: ChartData[];
  activeUsersByDay: ChartData[];
  usersByRole: ChartData[];
  topPerformers: Array<{
    userId: string;
    userName: string;
    completedTasks: number;
    averageRating: number;
  }>;
}

// Error Log Types
export interface ErrorLog {
  _id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context: {
    userId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
  };
  correlationId: string;
  createdAt: Date;
}

// Socket Event Types
export interface SocketEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
}

// Table Types
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T) => React.ReactNode;
}

// Filter Types
export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// System Types
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  dbConnections: number;
  redisConnections: number;
  lastUpdated: Date;
}
