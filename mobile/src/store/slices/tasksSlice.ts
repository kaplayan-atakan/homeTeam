import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksService } from '../../services/api/tasksService';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  group: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  startDate?: string;
  completedAt?: string;
  slaHours: number;
  slaDeadline: string;
  estimatedDuration?: number;
  points?: number;
  category?: string;
  comments?: TaskComment[];
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  userId: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  createdAt: string;
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

export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  myTasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  groupTasks: { [groupId: string]: Task[] };
  totalTasks: number;
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  filter: TaskFilter;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  myTasks: [],
  pendingTasks: [],
  completedTasks: [],
  groupTasks: {},
  totalTasks: 0,
  currentPage: 1,
  hasMore: true,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  filter: {},
};

// Async thunks
export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (filter: TaskFilter = {}, { rejectWithValue }) => {
    try {
      const response = await tasksService.getTasks(filter);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görevler yüklenemedi');
    }
  }
);

export const fetchTaskByIdAsync = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await tasksService.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev bulunamadı');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await tasksService.createTask(taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev oluşturulamadı');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }: { taskId: string; taskData: Partial<Task> }, { rejectWithValue }) => {
    try {
      const response = await tasksService.updateTask(taskId, taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev güncellenemedi');
    }
  }
);

export const completeTaskAsync = createAsyncThunk(
  'tasks/completeTask',
  async ({ taskId, comment }: { taskId: string; comment?: string }, { rejectWithValue }) => {
    try {
      const response = await tasksService.completeTask(taskId, { comment });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev tamamlanamadı');
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await tasksService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev silinemedi');
    }
  }
);

export const fetchMyTasksAsync = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (filter: TaskFilter = {}, { rejectWithValue }) => {
    try {
      const response = await tasksService.getMyTasks(filter);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görevlerim yüklenemedi');
    }
  }
);

export const fetchPendingTasksAsync = createAsyncThunk(
  'tasks/fetchPendingTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksService.getPendingTasks();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Bekleyen görevler yüklenemedi');
    }
  }
);

export const fetchCompletedTasksAsync = createAsyncThunk(
  'tasks/fetchCompletedTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tasksService.getCompletedTasks();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Tamamlanan görevler yüklenemedi');
    }
  }
);

export const addCommentAsync = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, comment }: { taskId: string; comment: string }, { rejectWithValue }) => {
    try {
      const response = await tasksService.addComment(taskId, { comment });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Yorum eklenemedi');
    }
  }
);

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter: (state) => {
      state.filter = {};
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const updatedTask = action.payload;
      
      // Ana task listesini güncelle
      const taskIndex = state.tasks.findIndex(task => task.id === updatedTask.id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = updatedTask;
      }
      
      // Diğer listeleri de güncelle
      const updateTaskInArray = (array: Task[]) => {
        const index = array.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          array[index] = updatedTask;
        }
      };
      
      updateTaskInArray(state.myTasks);
      updateTaskInArray(state.pendingTasks);
      updateTaskInArray(state.completedTasks);
      
      // Grup görevlerini güncelle
      Object.keys(state.groupTasks).forEach(groupId => {
        updateTaskInArray(state.groupTasks[groupId]);
      });
      
      // Mevcut görevi güncelle
      if (state.currentTask && state.currentTask.id === updatedTask.id) {
        state.currentTask = updatedTask;
      }
    },
    removeTaskFromList: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      
      // Ana listeden kaldır
      state.tasks = state.tasks.filter(task => task.id !== taskId);
      state.myTasks = state.myTasks.filter(task => task.id !== taskId);
      state.pendingTasks = state.pendingTasks.filter(task => task.id !== taskId);
      state.completedTasks = state.completedTasks.filter(task => task.id !== taskId);
      
      // Grup görevlerinden kaldır
      Object.keys(state.groupTasks).forEach(groupId => {
        state.groupTasks[groupId] = state.groupTasks[groupId].filter(task => task.id !== taskId);
      });
      
      // Mevcut görevi temizle
      if (state.currentTask && state.currentTask.id === taskId) {
        state.currentTask = null;
      }
    },
    addTaskToList: (state, action: PayloadAction<Task>) => {
      const newTask = action.payload;
      
      // Ana listeye ekle
      state.tasks.unshift(newTask);
      
      // Duruma göre ilgili listelere ekle
      if (newTask.status === 'pending') {
        state.pendingTasks.unshift(newTask);
      } else if (newTask.status === 'completed') {
        state.completedTasks.unshift(newTask);
      }
      
      // Kendi görevlerine ekle (eğer kullanıcıya atanmışsa)
      // Bu kontrol parent component'te yapılacak
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data?.tasks || [];
        state.totalTasks = action.payload.data?.total || 0;
        state.currentPage = action.payload.data?.page || 1;
        state.hasMore = state.tasks.length < state.totalTasks;
        state.error = null;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Task By ID
    builder
      .addCase(fetchTaskByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload.data;
        state.error = null;
      })
      .addCase(fetchTaskByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Task
    builder
      .addCase(createTaskAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        const newTask = action.payload.data;
        state.tasks.unshift(newTask);
        state.error = null;
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update Task
    builder
      .addCase(updateTaskAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedTask = action.payload.data;
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: updatedTask, 
          type: 'updateTaskInList' 
        });
        state.error = null;
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Complete Task
    builder
      .addCase(completeTaskAsync.fulfilled, (state, action) => {
        const completedTask = action.payload.data;
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: completedTask, 
          type: 'updateTaskInList' 
        });
      });

    // Delete Task
    builder
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        const taskId = action.payload;
        tasksSlice.caseReducers.removeTaskFromList(state, { 
          payload: taskId, 
          type: 'removeTaskFromList' 
        });
      });

    // Fetch My Tasks
    builder
      .addCase(fetchMyTasksAsync.fulfilled, (state, action) => {
        state.myTasks = action.payload.data?.tasks || [];
      });

    // Fetch Pending Tasks
    builder
      .addCase(fetchPendingTasksAsync.fulfilled, (state, action) => {
        state.pendingTasks = action.payload.data?.tasks || [];
      });

    // Fetch Completed Tasks
    builder
      .addCase(fetchCompletedTasksAsync.fulfilled, (state, action) => {
        state.completedTasks = action.payload.data?.tasks || [];
      });

    // Add Comment
    builder
      .addCase(addCommentAsync.fulfilled, (state, action) => {
        const updatedTask = action.payload.data;
        if (state.currentTask && state.currentTask.id === updatedTask.id) {
          state.currentTask = updatedTask;
        }
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: updatedTask, 
          type: 'updateTaskInList' 
        });
      });
  },
});

export const {
  clearError,
  setFilter,
  clearFilter,
  setCurrentTask,
  updateTaskInList,
  removeTaskFromList,
  addTaskToList,
} = tasksSlice.actions;

export default tasksSlice.reducer;
