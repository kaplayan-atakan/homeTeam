// Task modeli için tür tanımlamaları

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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  owner: User;
  members: User[];
  settings: {
    canMembersCreateTasks: boolean;
    canMembersAssignTasks: boolean;
    canMembersDeleteTasks: boolean;
    requireApprovalForTasks: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  user: User;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
}

export interface MusicIntegration {
  autoPlay: boolean;
  playlistId?: string;
  spotifyPlaylistId?: string;
  youtubePlaylistId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: User;
  createdBy: User;
  group?: Group;
  groupId?: string;
  slaMinutes?: number;
  startDate: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: User;
  completionNote?: string;
  actualTime?: number;
  tags: string[];
  points?: number;
  comments: Comment[];
  activityLog: ActivityLog[];
  musicIntegration?: MusicIntegration;
  createdAt: string;
  updatedAt: string;
}

// DTO'lar (Data Transfer Objects)
export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignedTo: string;
  groupId: string;
  dueDate: string;
  slaMinutes?: number;
  tags?: string[];
  musicIntegration?: MusicIntegration;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  slaMinutes?: number;
  tags?: string[];
  status?: TaskStatus;
  completionNote?: string;
}

export interface CompleteTaskDto {
  completionNote?: string;
  actualTime?: number;
}

// API Response türleri
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Redux Store için state türleri
export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentTask: Task | null;
}
