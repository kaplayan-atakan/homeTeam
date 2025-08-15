import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskState, TaskFilters } from '@/types';

// Initial state
const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {},
};

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action: PayloadAction<TaskFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const { 
  setTasks, 
  addTask, 
  updateTask, 
  removeTask, 
  setSelectedTask, 
  setFilters, 
  clearError 
} = taskSlice.actions;

// Selectors
export const selectTasks = (state: { tasks: TaskState }) => state.tasks.tasks;
export const selectSelectedTask = (state: { tasks: TaskState }) => state.tasks.selectedTask;
export const selectTasksLoading = (state: { tasks: TaskState }) => state.tasks.isLoading;
export const selectTasksError = (state: { tasks: TaskState }) => state.tasks.error;
export const selectTaskFilters = (state: { tasks: TaskState }) => state.tasks.filters;

// Reducer
export default taskSlice.reducer;
