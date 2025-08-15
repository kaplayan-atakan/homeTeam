import { apiClient } from './apiClient';
import { TaskStatus, TaskPriority, Task } from '../types/task.types';

interface CreateTaskData {
  title: string;
  description: string;
  groupId: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
}

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export class TaskService {
  // Task overview stats için backend endpoint
  async getTaskStatsOverview(): Promise<TaskStats> {
    return await apiClient.getData('/tasks/stats/overview');
  }

  // Tüm görevleri getir (pagination ile)
  async getTasks(page = 1, limit = 20, groupId?: string): Promise<{ tasks: Task[], total: number, page: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(groupId && { groupId })
    });
    
    return await apiClient.getData(`/tasks?${params.toString()}`);
  }

  // Kullanıcının bekleyen görevleri
  async getMyPendingTasks(): Promise<Task[]> {
    return await apiClient.getData('/tasks/my/pending');
  }

  // Kullanıcının geciken görevleri
  async getMyOverdueTasks(): Promise<Task[]> {
    return await apiClient.getData('/tasks/my/overdue');
  }

  // Bugün tamamlanan görevler
  async getMyCompletedTodayTasks(): Promise<Task[]> {
    return await apiClient.getData('/tasks/my/completed/today');
  }

  // Tekil görev detayı
  async getTaskById(taskId: string): Promise<Task> {
    return await apiClient.getData(`/tasks/${taskId}`);
  }

  // Yeni görev oluştur
  async createTask(taskData: CreateTaskData): Promise<Task> {
    return await apiClient.postData('/tasks', taskData);
  }

  // Görev güncelle
  async updateTask(taskId: string, updateData: UpdateTaskData): Promise<Task> {
    return await apiClient.putData(`/tasks/${taskId}`, updateData);
  }

  // Görev tamamla
  async completeTask(taskId: string): Promise<Task> {
    return await apiClient.putData(`/tasks/${taskId}/complete`, {});
  }

  // Görevi başlat
  async startTask(taskId: string): Promise<Task> {
    return await apiClient.putData(`/tasks/${taskId}/start`, {});
  }

  // Görev sil
  async deleteTask(taskId: string): Promise<void> {
    return await apiClient.deleteData(`/tasks/${taskId}`);
  }

  // Görev yorumları
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return await apiClient.getData(`/tasks/${taskId}/comments`);
  }

  // Yorum ekle
  async addTaskComment(taskId: string, comment: string): Promise<TaskComment> {
    return await apiClient.postData(`/tasks/${taskId}/comments`, { comment });
  }

  // Gruba göre görevleri getir
  async getTasksByGroup(groupId: string): Promise<Task[]> {
    return await apiClient.getData(`/groups/${groupId}/tasks`);
  }

  // Kullanıcının tüm görevleri
  async getMyTasks(): Promise<Task[]> {
    return await apiClient.getData('/tasks/my');
  }
}

// Singleton instance export
export const taskService = new TaskService();
