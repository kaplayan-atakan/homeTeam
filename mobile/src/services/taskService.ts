import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResponse } from '../types/task.types';
import { Task, CreateTaskDto, UpdateTaskDto, CompleteTaskDto } from '../types/task.types';

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  groupId?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface TaskSortOptions {
  field: 'dueDate' | 'priority' | 'created' | 'title' | 'status';
  order: 'asc' | 'desc';
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  filters?: TaskFilters;
  sort?: TaskSortOptions;
  search?: string;
}

export class TaskService {
  private baseUrl = '/tasks';

  // Görev listesi getir
  async getTasks(params: GetTasksParams = {}): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    if (params.sort) {
      queryParams.append('sortBy', params.sort.field);
      queryParams.append('sortOrder', params.sort.order);
    }

    const response = await apiClient.get(`${this.baseUrl}?${queryParams.toString()}`);
    return response.data;
  }

  // Kullanıcının görevlerini getir
  async getMyTasks(params: GetTasksParams = {}): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`${this.baseUrl}/my-tasks?${queryParams.toString()}`);
    return response.data;
  }

  // Tekil görev getir
  async getTaskById(taskId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.get(`${this.baseUrl}/${taskId}`);
    return response.data;
  }

  // Yeni görev oluştur
  async createTask(taskData: CreateTaskDto): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(this.baseUrl, taskData);
    return response.data;
  }

  // Görev güncelle
  async updateTask(taskId: string, taskData: UpdateTaskDto): Promise<ApiResponse<Task>> {
    const response = await apiClient.patch(`${this.baseUrl}/${taskId}`, taskData);
    return response.data;
  }

  // Görev sil
  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.baseUrl}/${taskId}`);
    return response.data;
  }

  // Görev tamamla
  async completeTask(taskId: string, completionData: CompleteTaskDto = {}): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/complete`, completionData);
    return response.data;
  }

  // Görev başlat
  async startTask(taskId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/start`);
    return response.data;
  }

  // Görev duraklat
  async pauseTask(taskId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/pause`);
    return response.data;
  }

  // Görev iptal et
  async cancelTask(taskId: string, reason?: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/cancel`, { reason });
    return response.data;
  }

  // Görevi yeniden aç
  async reopenTask(taskId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/reopen`);
    return response.data;
  }

  // Görev atama
  async assignTask(taskId: string, assignedTo: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/assign`, { assignedTo });
    return response.data;
  }

  // Görev atamasını kaldır
  async unassignTask(taskId: string): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/unassign`);
    return response.data;
  }

  // Yorumu ekle
  async addComment(taskId: string, content: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/comments`, { content });
    return response.data;
  }

  // Görev istatistikleri
  async getTaskStats(groupId?: string): Promise<ApiResponse<any>> {
    const url = groupId ? `${this.baseUrl}/stats?groupId=${groupId}` : `${this.baseUrl}/stats`;
    const response = await apiClient.get(url);
    return response.data;
  }

  // Geciken görevler
  async getOverdueTasks(): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get(`${this.baseUrl}/overdue`);
    return response.data;
  }

  // Yaklaşan görevler
  async getUpcomingTasks(days: number = 7): Promise<ApiResponse<Task[]>> {
    const response = await apiClient.get(`${this.baseUrl}/upcoming?days=${days}`);
    return response.data;
  }

  // Görev şablonu oluştur
  async createTaskTemplate(taskData: CreateTaskDto): Promise<ApiResponse<any>> {
    const response = await apiClient.post(`${this.baseUrl}/templates`, taskData);
    return response.data;
  }

  // Şablondan görev oluştur
  async createFromTemplate(templateId: string, overrides: Partial<CreateTaskDto> = {}): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/templates/${templateId}/create`, overrides);
    return response.data;
  }

  // Görev tekrarı oluştur
  async createRecurringTask(taskData: CreateTaskDto & { recurrence: any }): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/recurring`, taskData);
    return response.data;
  }

  // Görev kopala
  async duplicateTask(taskId: string, overrides: Partial<CreateTaskDto> = {}): Promise<ApiResponse<Task>> {
    const response = await apiClient.post(`${this.baseUrl}/${taskId}/duplicate`, overrides);
    return response.data;
  }

  // Toplu işlemler
  async bulkUpdateTasks(taskIds: string[], updates: Partial<UpdateTaskDto>): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(`${this.baseUrl}/bulk`, { taskIds, updates });
    return response.data;
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.baseUrl}/bulk`, { data: { taskIds } });
    return response.data;
  }

  // Export/Import
  async exportTasks(groupId?: string, format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const url = groupId 
      ? `${this.baseUrl}/export?groupId=${groupId}&format=${format}`
      : `${this.baseUrl}/export?format=${format}`;
    const response = await apiClient.downloadFile(url);
    return response.data;
  }

  async importTasks(file: FormData): Promise<ApiResponse<any>> {
    const response = await apiClient.uploadFile(`${this.baseUrl}/import`, file);
    return response.data;
  }
}

export const taskService = new TaskService();
