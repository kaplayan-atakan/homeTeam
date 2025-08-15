import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskService } from '../../services/taskService';
import { Task, TaskStatus, TaskPriority } from '../../types/task.types';

export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  myTasks: Task[];
  pendingTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  groupTasks: { [groupId: string]: Task[] };
  totalTasks: number;
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  taskStats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  myTasks: [],
  pendingTasks: [],
  completedTasks: [],
  overdueTasks: [],
  groupTasks: {},
  totalTasks: 0,
  currentPage: 1,
  hasMore: true,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  taskStats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  },
};

// Real API Async Thunks - NO MORE MOCK DATA!
export const fetchTaskStatsAsync = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getTaskStatsOverview();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Task istatistikleri yüklenemedi');
    }
  }
);

export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: { page?: number; limit?: number; groupId?: string } = {}, { rejectWithValue }) => {
    try {
      return await taskService.getTasks(params.page, params.limit, params.groupId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görevler yüklenemedi');
    }
  }
);

export const fetchMyPendingTasksAsync = createAsyncThunk(
  'tasks/fetchMyPendingTasks',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getMyPendingTasks();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Bekleyen görevler yüklenemedi');
    }
  }
);

export const fetchMyOverdueTasksAsync = createAsyncThunk(
  'tasks/fetchMyOverdueTasks',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getMyOverdueTasks();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Geciken görevler yüklenemedi');
    }
  }
);

export const fetchMyCompletedTodayTasksAsync = createAsyncThunk(
  'tasks/fetchMyCompletedTodayTasks',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getMyCompletedTodayTasks();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Tamamlanan görevler yüklenemedi');
    }
  }
);

export const fetchTaskByIdAsync = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await taskService.getTaskById(taskId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görev bulunamadı');
    }
  }
);

export const createTaskAsync = createAsyncThunk(
  'tasks/createTask',
  async (taskData: {
    title: string;
    description: string;
    groupId: string;
    assignedTo: string;
    dueDate: string;
    priority: TaskPriority;
  }, { rejectWithValue }) => {
    try {
      return await taskService.createTask(taskData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görev oluşturulamadı');
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  'tasks/updateTask',
  async ({ 
    taskId, 
    taskData 
  }: { 
    taskId: string; 
    taskData: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
    }
  }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(taskId, taskData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görev güncellenemedi');
    }
  }
);

export const completeTaskAsync = createAsyncThunk(
  'tasks/completeTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await taskService.completeTask(taskId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görev tamamlanamadı');
    }
  }
);

export const startTaskAsync = createAsyncThunk(
  'tasks/startTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await taskService.startTask(taskId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görev başlatılamadı');
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
      return rejectWithValue(error.message || 'Görev silinemedi');
    }
  }
);

export const fetchTasksByGroupAsync = createAsyncThunk(
  'tasks/fetchTasksByGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await taskService.getTasksByGroup(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Grup görevleri yüklenemedi');
    }
  }
);

export const fetchMyTasksAsync = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (_, { rejectWithValue }) => {
    try {
      return await taskService.getMyTasks();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Görevlerim yüklenemedi');
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
      updateTaskInArray(state.overdueTasks);
      
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
      state.overdueTasks = state.overdueTasks.filter(task => task.id !== taskId);
      
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
      if (newTask.status === TaskStatus.PENDING) {
        state.pendingTasks.unshift(newTask);
      } else if (newTask.status === TaskStatus.COMPLETED) {
        state.completedTasks.unshift(newTask);
      } else if (newTask.status === TaskStatus.OVERDUE) {
        state.overdueTasks.unshift(newTask);
      }
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMore = true;
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Task Stats
    builder
      .addCase(fetchTaskStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskStats = action.payload;
      })
      .addCase(fetchTaskStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Tasks (with pagination)
    builder
      .addCase(fetchTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const response = action.payload;
        
        if (state.currentPage === 1) {
          state.tasks = response.tasks;
        } else {
          state.tasks.push(...response.tasks);
        }
        
        state.totalTasks = response.total;
        state.currentPage = response.page;
        state.hasMore = response.tasks.length > 0 && state.tasks.length < response.total;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Tasks
    builder
      .addCase(fetchMyTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myTasks = action.payload;
      })
      .addCase(fetchMyTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Pending Tasks
    builder
      .addCase(fetchMyPendingTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPendingTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingTasks = action.payload;
      })
      .addCase(fetchMyPendingTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Overdue Tasks
    builder
      .addCase(fetchMyOverdueTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyOverdueTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overdueTasks = action.payload;
      })
      .addCase(fetchMyOverdueTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Completed Today Tasks
    builder
      .addCase(fetchMyCompletedTodayTasksAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyCompletedTodayTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.completedTasks = action.payload;
      })
      .addCase(fetchMyCompletedTodayTasksAsync.rejected, (state, action) => {
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
        state.tasks.unshift(action.payload);
        state.totalTasks += 1;
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
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: action.payload, 
          type: 'updateTaskInList' 
        });
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Complete Task
    builder
      .addCase(completeTaskAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(completeTaskAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: action.payload, 
          type: 'updateTaskInList' 
        });
      })
      .addCase(completeTaskAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Start Task
    builder
      .addCase(startTaskAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(startTaskAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        tasksSlice.caseReducers.updateTaskInList(state, { 
          payload: action.payload, 
          type: 'updateTaskInList' 
        });
      })
      .addCase(startTaskAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete Task
    builder
      .addCase(deleteTaskAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const taskId = action.payload;
        tasksSlice.caseReducers.removeTaskFromList(state, { 
          payload: taskId, 
          type: 'removeTaskFromList' 
        });
        state.totalTasks = Math.max(0, state.totalTasks - 1);
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Fetch Tasks by Group
    builder
      .addCase(fetchTasksByGroupAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksByGroupAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Group ID'yi action meta'dan alacağız
        const groupId = action.meta.arg;
        state.groupTasks[groupId] = action.payload;
      })
      .addCase(fetchTasksByGroupAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentTask,
  updateTaskInList,
  removeTaskFromList,
  addTaskToList,
  resetPagination,
} = tasksSlice.actions;

export default tasksSlice.reducer;
