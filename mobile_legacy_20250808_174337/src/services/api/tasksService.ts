import { apiClient } from './authService';
import { API_ENDPOINTS } from '../constants';

export interface TaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  group: string;
  slaHours: number;
  dueDate: string;
  startDate?: string;
  category?: string;
  estimatedDuration?: number;
  points?: number;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceInterval?: number;
  musicSettings?: {
    spotifyPlaylistId?: string;
    youtubePlaylistId?: string;
    autoPlay: boolean;
  };
}

export interface TaskFilter {
  status?: string;
  priority?: string;
  assignedTo?: string;
  group?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  overdue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CommentData {
  comment: string;
}

export interface CompleteTaskData {
  comment?: string;
  actualDuration?: number;
}

export const tasksService = {
  // Görevleri listele
  async getTasks(filter: TaskFilter = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${API_ENDPOINTS.TASKS.LIST}?${params.toString()}`);
    return response;
  },

  // Görev detayını getir
  async getTaskById(taskId: string) {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.DETAIL(taskId));
    return response;
  },

  // Yeni görev oluştur
  async createTask(taskData: Partial<TaskData>) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.CREATE, taskData);
    return response;
  },

  // Görevi güncelle
  async updateTask(taskId: string, taskData: Partial<TaskData>) {
    const response = await apiClient.patch(API_ENDPOINTS.TASKS.UPDATE(taskId), taskData);
    return response;
  },

  // Görevi sil
  async deleteTask(taskId: string) {
    const response = await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(taskId));
    return response;
  },

  // Görevi tamamla
  async completeTask(taskId: string, data: CompleteTaskData = {}) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.COMPLETE(taskId), data);
    return response;
  },

  // Görevi ata
  async assignTask(taskId: string, assignedTo: string, reason?: string) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.ASSIGN(taskId), {
      assignedTo,
      reason,
    });
    return response;
  },

  // Kullanıcının görevlerini getir
  async getMyTasks(filter: TaskFilter = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${API_ENDPOINTS.TASKS.MY_TASKS}?${params.toString()}`);
    return response;
  },

  // Bekleyen görevleri getir
  async getPendingTasks() {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.MY_PENDING);
    return response;
  },

  // Tamamlanan görevleri getir
  async getCompletedTasks() {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.MY_COMPLETED);
    return response;
  },

  // Grup görevlerini getir
  async getGroupTasks(groupId: string, filter: TaskFilter = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(
      `${API_ENDPOINTS.TASKS.GROUP_TASKS(groupId)}?${params.toString()}`
    );
    return response;
  },

  // Görev yorumlarını getir
  async getComments(taskId: string) {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.COMMENTS(taskId));
    return response;
  },

  // Yorum ekle
  async addComment(taskId: string, commentData: CommentData) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.ADD_COMMENT(taskId), commentData);
    return response;
  },

  // Görev istatistikleri
  async getTaskStats(filter: {
    groupId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${API_ENDPOINTS.TASKS.STATS}?${params.toString()}`);
    return response;
  },

  // Toplu görev güncelleme
  async bulkUpdateTasks(data: {
    taskIds: string[];
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) {
    const response = await apiClient.patch(API_ENDPOINTS.TASKS.BULK_UPDATE, data);
    return response;
  },

  // Görev şablonları
  async getTaskTemplates() {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.TEMPLATES);
    return response;
  },

  // Şablondan görev oluştur
  async createTaskFromTemplate(templateId: string, data: {
    assignedTo: string;
    group: string;
    dueDate: string;
    customizations?: Partial<TaskData>;
  }) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.TEMPLATES, {
      templateId,
      ...data,
    });
    return response;
  },

  // Alt görevleri getir
  async getSubtasks(taskId: string) {
    const response = await apiClient.get(API_ENDPOINTS.TASKS.SUBTASKS(taskId));
    return response;
  },

  // Alt görev oluştur
  async createSubtask(parentTaskId: string, subtaskData: {
    title: string;
    description?: string;
    assignedTo?: string;
    slaHours?: number;
  }) {
    const response = await apiClient.post(API_ENDPOINTS.TASKS.SUBTASKS(parentTaskId), subtaskData);
    return response;
  },

  // Hızlı görev oluştur (basitleştirilmiş)
  async createSimpleTask(data: {
    title: string;
    description?: string;
    groupId?: string;
  }) {
    const response = await apiClient.post('/tasks/simple', data);
    return response;
  },
};
