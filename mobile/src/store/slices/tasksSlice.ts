import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TaskService, GetTasksParams, TaskFilters } from '../../services/taskService';
import { Task, CreateTaskDto, UpdateTaskDto, CompleteTaskDto, TaskStatus, TaskPriority } from '../../types/task.types';

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
  filters: TaskFilters;
}

// Create service instance
const taskService = new TaskService();

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
  filters: {},
};

// Async thunks
export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: GetTasksParams = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params);
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
      const response = await taskService.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev bulunamadı');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskDto, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev oluşturulamadı');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, taskData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev güncellenemedi');
    }
  }
);

export const completeTaskAsync = createAsyncThunk(
  'tasks/completeTask',
  async ({ taskId, data }: { taskId: string; data: CompleteTaskDto }, { rejectWithValue }) => {
    try {
      const response = await taskService.completeTask(taskId, data);
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
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görev silinemedi');
    }
  }
);

export const fetchMyTasksAsync = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (params: GetTasksParams = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyTasks(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Görevlerim yüklenemedi');
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
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
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
        const response = action.payload;
        state.tasks = response.data || [];
        state.totalTasks = response.total || 0;
        state.currentPage = response.page || 1;
        state.hasMore = (response.data?.length || 0) < state.totalTasks;
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
        state.currentTask = action.payload;
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
        const newTask = action.payload;
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
        const updatedTask = action.payload;
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
        const completedTask = action.payload;
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
        const response = action.payload;
        state.myTasks = response.data || [];
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentTask,
  updateTaskInList,
  removeTaskFromList,
  addTaskToList,
} = tasksSlice.actions;

export default tasksSlice.reducer;
